import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class AESGCMCipher:

    @staticmethod
    def encrypt(key: bytes, data: bytes):
        nonce = os.urandom(12)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(nonce, data, None)
        return nonce, ciphertext

    @staticmethod
    def decrypt(key: bytes, nonce: bytes, ciphertext: bytes):
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, ciphertext, None)
