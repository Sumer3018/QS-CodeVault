import os
import time
from app.crypto.pqc_kem import PQCLayer
from app.crypto.kdf import derive_aes_key
from app.crypto.aes_gcm import AESLayer
from Crypto.Random import get_random_bytes

class EncryptionService:
    @staticmethod
    def process_upload(file_bytes: bytes, mode: str = "hybrid"):
        metrics = {}
        total_start = time.perf_counter()

        # PREVENT 500 ERROR: Initialize defaults
        metrics['pqc_gen_ms'] = 0.0
        metrics['pqc_encap_ms'] = 0.0
        
        if mode == "hybrid":
            keys = PQCLayer.generate_keypair()
            metrics['pqc_gen_ms'] = keys['metrics_ms']

            kem_result = PQCLayer.encapsulate(keys['pk'])
            metrics['pqc_encap_ms'] = kem_result['metrics_ms']
            
            # CAPTURE SALT
            aes_key, salt = derive_aes_key(kem_result['shared_secret'])
            
            metadata = {
                "pqc_secret_key": keys['sk'],
                "pqc_ciphertext_cap": kem_result['ciphertext'],
                "kdf_salt": salt
            }
        else:
            # RSA SIMULATION (Baseline)
            time.sleep(0.05) 
            aes_key = get_random_bytes(32)
            salt = get_random_bytes(16)
            
            metadata = {
                "pqc_secret_key": None,
                "pqc_ciphertext_cap": None,
                "kdf_salt": salt
            }

        enc_result = AESLayer.encrypt_file(file_bytes, aes_key)
        metrics['aes_enc_ms'] = enc_result['metrics_ms']
        
        metadata["aes_nonce"] = enc_result['nonce']
        metadata["encryption_tag"] = enc_result['tag']

        metrics['total_ms'] = (time.perf_counter() - total_start) * 1000

        return {
            "encrypted_file": enc_result['ciphertext'],
            "metadata": metadata,
            "metrics": metrics
        }

    @staticmethod
    def process_download(encrypted_bytes: bytes, metadata: dict, mode: str):
        # RETRIEVE SALT
        salt = metadata.get('kdf_salt')
        
        if mode == "hybrid":
            pqc_result = PQCLayer.decapsulate(
                metadata['pqc_ciphertext_cap'], 
                metadata['pqc_secret_key']
            )
            # USE SAVED SALT
            aes_key, _ = derive_aes_key(pqc_result['shared_secret'], salt=salt)
        else:
            # BLOCK RSA DOWNLOAD (As requested for paper)
            raise ValueError("Baseline (RSA) files are for performance benchmarking only. Switch to Hybrid to decrypt.")

        decrypted_data, _ = AESLayer.decrypt_file(
            encrypted_bytes, 
            aes_key, 
            metadata['aes_nonce'], 
            metadata['encryption_tag']
        )
        return decrypted_data