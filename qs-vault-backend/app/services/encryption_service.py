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
            "total_ms": 0
        }

        # =============================
        # PHASE 1 — LOCAL PREP
        # =============================
        p = time.perf_counter()
        file_size = len(file_bytes)
        metrics["phase_1"]["size_bytes"] = file_size
        metrics["phase_1"]["read_ms"] = (time.perf_counter() - p) * 1000

        # =============================
        # PHASE 2 — KEY AGREEMENT
        # =============================
        p = time.perf_counter()
        kem_result = PQCLayer.encapsulate(SERVER_PUBLIC_KEY)
        metrics["phase_2"]["encap_us"] = (time.perf_counter() - p) * 1e6

        metrics["phase_2"]["ciphertext_size"] = len(kem_result["ciphertext"])
        metrics["phase_2"]["ss_preview"] = kem_result["shared_secret"].hex()[
            :16]

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

        mb = file_size / (1024 * 1024)
        metrics["phase_4"]["throughput_mb_s"] = mb / (aes_time / 1000 + 1e-9)

        # =============================
        # PHASE 5 — PACK
        # =============================
        p = time.perf_counter()
        final_blob = salt + enc["nonce"] + enc["tag"] + enc["ciphertext"]
        metrics["phase_5"]["pack_us"] = (time.perf_counter() - p) * 1e6

        metrics["total_ms"] = (time.perf_counter() - total_start) * 1000

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
