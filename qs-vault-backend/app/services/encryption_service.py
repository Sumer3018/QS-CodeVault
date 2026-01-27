import os
import time
from app.crypto.pqc_kem import PQCLayer
from app.crypto.kdf import derive_aes_key
from app.crypto.aes_gcm import AESLayer
from Crypto.Random import get_random_bytes


class EncryptionService:
    @staticmethod
    def process_upload(file_bytes: bytes, mode: str = "hybrid"):
        metrics = {'pqc_gen_ms': 0.0, 'pqc_encap_ms': 0.0}
        total_start = time.perf_counter()

        # 1. KEY EXCHANGE & SALT GENERATION
        if mode == "hybrid":
            keys = PQCLayer.generate_keypair()
            metrics['pqc_gen_ms'] = keys['metrics_ms']
            kem_result = PQCLayer.encapsulate(keys['pk'])
            metrics['pqc_encap_ms'] = kem_result['metrics_ms']

            # Generate Salt & Derive Key
            aes_key, salt = derive_aes_key(kem_result['shared_secret'])

            pqc_sk = keys['sk']
            pqc_cap = kem_result['ciphertext']
        else:
            # RSA Baseline Simulation
            time.sleep(0.05)
            aes_key = get_random_bytes(32)
            salt = get_random_bytes(16)
            pqc_sk = None
            pqc_cap = None

        # 2. ENCRYPT FILE
        enc_result = AESLayer.encrypt_file(file_bytes, aes_key)
        metrics['aes_enc_ms'] = enc_result['metrics_ms']
        metrics['total_ms'] = (time.perf_counter() - total_start) * 1000

        # 3. PACK THE BLOB (Salt + Nonce + Tag + Ciphertext)
        # This ensures the file carries its own decryption parameters.
        final_blob = (
            salt +                      # 16 Bytes
            enc_result['nonce'] +       # 12 Bytes
            enc_result['tag'] +         # 16 Bytes
            enc_result['ciphertext']    # Rest
        )

        # 4. METADATA (Only store what is needed to recover the Shared Secret)
        metadata = {
            "pqc_secret_key": pqc_sk,
            "pqc_ciphertext_cap": pqc_cap
            # NOTE: We do NOT need to store salt/nonce/tag in DB anymore.
        }

        return {
            "encrypted_file": final_blob,
            "metadata": metadata,
            "metrics": metrics
        }

    @staticmethod
    def process_download(file_blob: bytes, metadata: dict, mode: str):
        # 1. UNPACK THE BLOB
        # We extract the parameters directly from the file.
        try:
            salt = file_blob[:16]
            nonce = file_blob[16:28]
            tag = file_blob[28:44]
            ciphertext = file_blob[44:]
        except Exception:
            raise ValueError("File corrupted: Invalid header structure.")

        # 2. RECOVER KEY
        if mode == "hybrid":
            pqc_result = PQCLayer.decapsulate(
                metadata['pqc_ciphertext_cap'],
                metadata['pqc_secret_key']
            )
            # Derive the EXACT same key using the extracted salt
            aes_key, _ = derive_aes_key(pqc_result['shared_secret'], salt=salt)
        else:
            raise ValueError("RSA Baseline files are for benchmarking only.")

        # 3. DECRYPT
        decrypted_data, _ = AESLayer.decrypt_file(
            ciphertext, aes_key, nonce, tag)
        return decrypted_data
