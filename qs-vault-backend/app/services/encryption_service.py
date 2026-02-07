import time
import logging
import base64

from app.crypto.pqc_kem import PQCLayer
from app.crypto.kdf import derive_aes_key
from app.crypto.aes_gcm import AESLayer
from app.core.server_keys import SERVER_PUBLIC_KEY, SERVER_SECRET_KEY

logger = logging.getLogger("uvicorn")


class EncryptionService:

    @staticmethod
    def process_upload(file_bytes: bytes, mode: str = "hybrid"):
        metrics = {
            'pqc_encap_ms': 0.0,
            'aes_enc_ms': 0.0,
            'total_ms': 0.0
        }

        total_start = time.perf_counter()

        if mode == "hybrid":
            kem_result = PQCLayer.encapsulate(SERVER_PUBLIC_KEY)
            metrics['pqc_encap_ms'] = kem_result['metrics_ms']

            aes_key, salt = derive_aes_key(kem_result['shared_secret'])
            print("UPLOAD SALT:", salt.hex())

            pqc_cap_safe = base64.b64encode(kem_result['ciphertext']).decode()
        else:
            raise ValueError("Unsupported mode")

        enc_result = AESLayer.encrypt_file(file_bytes, aes_key)
        metrics['aes_enc_ms'] = enc_result['metrics_ms']
        metrics['total_ms'] = (time.perf_counter() - total_start) * 1000

        final_blob = (
            salt +
            enc_result['nonce'] +
            enc_result['tag'] +
            enc_result['ciphertext']
        )

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
