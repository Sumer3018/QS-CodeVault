import os
from app.crypto.pqc_kem import PQCKEM
from app.crypto.kdf import KeyDerivation
from app.crypto.aes_gcm import AESGCMCipher


class CryptoManager:
    """
    PQC-KEM → HKDF → AES-256-GCM
    """

    def encrypt_file(self, file_bytes: bytes, user_id: str):
        pk, sk = PQCKEM.generate_keypair()
        kem_ct, shared_secret = PQCKEM.encapsulate(pk)

        salt = os.urandom(16)
        aes_key = KeyDerivation.derive_aes_key(shared_secret, salt)

        nonce, ciphertext = AESGCMCipher.encrypt(aes_key, file_bytes)

        return {
            "ciphertext": ciphertext,
            "nonce": nonce,
            "kem_ciphertext": kem_ct,
            "salt": salt,
            "private_key": sk
        }
