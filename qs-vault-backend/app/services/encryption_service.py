import time
import logging
import base64

from app.crypto.pqc_kem import PQCLayer
from app.crypto.kdf import derive_aes_key
from app.crypto.aes_gcm import AESLayer
from app.core.server_keys import SERVER_PUBLIC_KEY, SERVER_SECRET_KEY

logger = logging.getLogger("uvicorn")


def now():
    return time.perf_counter()


class EncryptionService:

    # ===============================
    # UPLOAD
    # ===============================
    @staticmethod
    def process_upload(file_bytes: bytes, mode: str = "hybrid"):
        total_start = time.perf_counter()

        metrics = {
            "phase_1": {},
            "phase_2": {},
            "phase_3": {},
            "phase_4": {},
            "phase_5": {},
            "derived": {},
            "efficiency": {},
            "expansion": {},
            "structural": {},
            "total_ms": 0
        }

        # =============================
        # PHASE 1 — READ / LOCAL PREP
        # =============================
        p = time.perf_counter()
        file_size = len(file_bytes)
        metrics["phase_1"]["size_bytes"] = file_size
        metrics["phase_1"]["read_ms"] = (time.perf_counter() - p) * 1000

        # =============================
        # PHASE 2 — KEM
        # =============================
        p = time.perf_counter()
        kem_result = PQCLayer.encapsulate(SERVER_PUBLIC_KEY)
        metrics["phase_2"]["encap_us"] = (time.perf_counter() - p) * 1e6
        metrics["phase_2"]["ciphertext_size"] = len(kem_result["ciphertext"])

        # =============================
        # PHASE 3 — HKDF
        # =============================
        p = time.perf_counter()
        aes_key, salt = derive_aes_key(kem_result["shared_secret"])
        metrics["phase_3"]["hkdf_us"] = (time.perf_counter() - p) * 1e6

        # =============================
        # PHASE 4 — AES
        # =============================
        p = time.perf_counter()
        enc = AESLayer.encrypt_file(file_bytes, aes_key)
        aes_time = (time.perf_counter() - p) * 1000

        metrics["phase_4"]["aes_enc_ms"] = aes_time
        metrics["phase_4"]["nonce_size"] = len(enc["nonce"])
        metrics["phase_4"]["tag_size"] = len(enc["tag"])

        # =============================
        # PHASE 5 — PACK
        # =============================
        p = time.perf_counter()
        final_blob = salt + enc["nonce"] + enc["tag"] + enc["ciphertext"]
        metrics["phase_5"]["pack_us"] = (time.perf_counter() - p) * 1e6

        total_ms = (time.perf_counter() - total_start) * 1000
        metrics["total_ms"] = total_ms

        # ============================================================
        # 🔥 DERIVED INTELLIGENCE (THIS IS THE BIG LEAP)
        # ============================================================

        encap_ms = metrics["phase_2"]["encap_us"] / 1000
        hkdf_ms = metrics["phase_3"]["hkdf_us"] / 1000
        pack_ms = metrics["phase_5"]["pack_us"] / 1000
        read_ms = metrics["phase_1"]["read_ms"]

        crypto_time = encap_ms + hkdf_ms + aes_time
        io_time = read_ms + pack_ms
        overhead = max(total_ms - crypto_time - io_time, 0)

        metrics["derived"] = {
            "crypto_time_ms": crypto_time,
            "io_time_ms": io_time,
            "overhead_ms": overhead,
            "crypto_percent": (crypto_time / total_ms) * 100 if total_ms else 0,
            "io_percent": (io_time / total_ms) * 100 if total_ms else 0,
        }

        # ============================================================
        # ⚡ EFFICIENCY
        # ============================================================

        mb = file_size / (1024 * 1024)
        metrics["efficiency"] = {
            "mb_per_sec": mb / (total_ms / 1000 + 1e-9),
            "ms_per_mb": total_ms / (mb + 1e-9),
            "time_per_byte_ns": (total_ms * 1e6) / (file_size + 1e-9),
        }

        # ============================================================
        # 📦 EXPANSION
        # ============================================================

        cipher_size = len(final_blob)
        metrics["expansion"] = {
            "plaintext_bytes": file_size,
            "ciphertext_bytes": cipher_size,
            "expansion_ratio": cipher_size / (file_size + 1e-9),
        }

        # ============================================================
        # 🧬 STRUCTURAL
        # ============================================================

        metrics["structural"] = {
            "aes_nonce": len(enc["nonce"]),
            "aes_tag": len(enc["tag"]),
            "kem_ciphertext": len(kem_result["ciphertext"]),
            "aes_key_size": len(aes_key),
        }

        pqc_cap_safe = base64.b64encode(kem_result["ciphertext"]).decode()

        metadata = {
            "pqc_secret_key": None,
            "pqc_ciphertext_cap": pqc_cap_safe
        }

        print("UPLOAD OK | total:", metrics["total_ms"])

        return {
            "encrypted_file": final_blob,
            "metadata": metadata,
            "metrics": metrics
        }


    # ===============================
    # DOWNLOAD (unchanged)
    # ===============================

    @staticmethod
    def process_download(file_blob: bytes, metadata: dict, mode: str):
        try:
            salt = file_blob[:16]
            print("DOWNLOAD SALT:", salt.hex())
            nonce = file_blob[16:28]
            tag = file_blob[28:44]
            ciphertext = file_blob[44:]
        except Exception:
            raise ValueError("File corrupted")

        pqc_cap = base64.b64decode(metadata['pqc_ciphertext_cap'])

        print("DOWNLOAD CT:", pqc_cap.hex())

        pqc_result = PQCLayer.decapsulate(
            pqc_cap,
            SERVER_SECRET_KEY
        )
        print("DOWNLOAD SS:", pqc_result['shared_secret'].hex())

        aes_key, _ = derive_aes_key(
            pqc_result['shared_secret'],
            salt=salt
        )

        decrypted_data, _ = AESLayer.decrypt_file(
            ciphertext, aes_key, nonce, tag
        )

        print("DOWNLOAD OK")
        print("DOWNLOAD AES:", aes_key.hex())

        return decrypted_data
