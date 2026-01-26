import os
import secrets
from app.crypto.pqc_kem import PQCLayer
from app.crypto.kdf import derive_aes_key
from app.crypto.aes_gcm import AESLayer
from app.core.config import settings

class EncryptionService:
    """
    Orchestrates the Hybrid Post-Quantum Pipeline.
    Strictly follows: PQC-KEM -> HKDF -> AES-GCM
    """

    @staticmethod
    def process_upload(file_bytes: bytes):
        """
        1. Generate Ephemeral PQC Keypair (Kyber-512)
        2. Encapsulate Shared Secret (SS)
        3. Derive AES Key (HKDF)
        4. Encrypt File (AES-GCM)
        """
        metrics = {}

        # 1. PQC Layer: Generate Ephemeral Keys (Unique per file!)
        # ensuring forward secrecy for every single upload.
        keys = PQCLayer.generate_keypair()
        metrics['pqc_gen_ms'] = keys['metrics_ms']

        # 2. PQC Layer: Encapsulate (Generate Shared Secret)
        # We simulate the sender encapsulating against the receiver's pub key
        kem_result = PQCLayer.encapsulate(keys['pk'])
        metrics['pqc_encap_ms'] = kem_result['metrics_ms']
        
        shared_secret = kem_result['shared_secret']
        ciphertext_cap = kem_result['ciphertext']

        # 3. KDF Layer: Derive AES Session Key
        # HKDF ensures the somewhat-biased KEM output becomes uniform random
        aes_key, salt = derive_aes_key(shared_secret)
        
        # 4. AES Layer: Encrypt Data
        enc_result = AESLayer.encrypt_file(file_bytes, aes_key)
        metrics['aes_enc_ms'] = enc_result['metrics_ms']

        return {
            "encrypted_file": enc_result['ciphertext'],
            "metadata": {
                "pqc_secret_key": keys['sk'],         # Stored in Gateway (Trusted)
                "pqc_ciphertext_cap": ciphertext_cap, # Stored in Gateway/Cloud
                "aes_nonce": enc_result['nonce'],     # Public
                "encryption_tag": enc_result['tag'],  # Public (for integrity)
            },
            "metrics": metrics
        }

    @staticmethod
    def process_download(encrypted_bytes: bytes, metadata: dict):
        """
        1. Retrieve PQC Secret Key
        2. Decapsulate Shared Secret
        3. Regenerate AES Key
        4. Decrypt & Verify Integrity
        """
        metrics = {}

        # 1. PQC Layer: Decapsulate
        # Uses the stored private key to recover the shared secret
        pqc_result = PQCLayer.decapsulate(
            metadata['pqc_ciphertext_cap'], 
            metadata['pqc_secret_key']
        )
        metrics['pqc_decap_ms'] = pqc_result['metrics_ms']
        shared_secret = pqc_result['shared_secret']

        # 2. KDF Layer: Regenerate AES Key
        # Must produce exact same key as upload
        aes_key, _ = derive_aes_key(shared_secret, salt=None) # Fixed salt logic in KDF for simplicity or store salt

        # 3. AES Layer: Decrypt
        # This will RAISE ERROR if tag verification fails (Tamper Check)
        decrypted_data, aes_time = AESLayer.decrypt_file(
            encrypted_bytes, 
            aes_key, 
            metadata['aes_nonce'], 
            metadata['encryption_tag']
        )
        metrics['aes_dec_ms'] = aes_time

        return decrypted_data, metrics