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
        total_start = now()

        metrics = {}

        if mode == "hybrid":
            # --------------------
            # KEM ENCAP
            # --------------------
            s = now()
            kem_result = PQCLayer.encapsulate(SERVER_PUBLIC_KEY)
            metrics["kem_encap_us"] = (now() - s) * 1e6
            metrics["ciphertext_size"] = len(kem_result['ciphertext'])

            # --------------------
            # HKDF
            # --------------------
            s = now()
            aes_key, salt = derive_aes_key(kem_result['shared_secret'])
            metrics["kdf_us"] = (now() - s) * 1e6
            metrics["salt_size"] = len(salt)

            print("UPLOAD SALT:", salt.hex())

            pqc_cap_safe = base64.b64encode(
                kem_result['ciphertext']).decode()

        else:
            raise ValueError("Unsupported mode")

        # --------------------
        # AES ENCRYPT
        # --------------------
        s = now()
        enc_result = AESLayer.encrypt_file(file_bytes, aes_key)
        aes_time = (now() - s)
        metrics["aes_enc_ms"] = aes_time * 1000
        metrics["throughput_mb_s"] = (
            len(file_bytes) / (1024 * 1024)) / (aes_time + 1e-9)

        metrics["nonce_size"] = len(enc_result['nonce'])
        metrics["tag_size"] = len(enc_result['tag'])

        # --------------------
        # PACK
        # --------------------
        s = now()
        final_blob = (
            salt +
            enc_result['nonce'] +
            enc_result['tag'] +
            enc_result['ciphertext']
        )
        metrics["pack_us"] = (now() - s) * 1e6

        # --------------------
        # TOTAL
        # --------------------
        metrics["total_ms"] = (now() - total_start) * 1000
        metrics["file_size"] = len(file_bytes)

        metadata = {
            "pqc_secret_key": None,
            "pqc_ciphertext_cap": pqc_cap_safe
        }

        print("UPLOAD OK")
        print("UPLOAD AES:", aes_key.hex())
        print("UPLOAD SS:", kem_result['shared_secret'].hex())
        print("UPLOAD CT:", kem_result['ciphertext'].hex())

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
