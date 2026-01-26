from Crypto.Cipher import AES
import time

class AESLayer:
    @staticmethod
    def encrypt_file(file_bytes: bytes, key: bytes):
        """
        Encrypts file bytes using AES-256-GCM.
        Returns: ciphertext, nonce, tag
        """
        start = time.perf_counter()
        
        cipher = AES.new(key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(file_bytes)
        
        duration = (time.perf_counter() - start) * 1000
        
        return {
            "ciphertext": ciphertext,
            "nonce": cipher.nonce,
            "tag": tag,
            "metrics_ms": duration
        }

    @staticmethod
    def decrypt_file(ciphertext: bytes, key: bytes, nonce: bytes, tag: bytes):
        """
        Decrypts and authenticates. Raises ValueError if tag is invalid.
        """
        start = time.perf_counter()
        
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        try:
            plaintext = cipher.decrypt_and_verify(ciphertext, tag)
            duration = (time.perf_counter() - start) * 1000
            return plaintext, duration
        except ValueError:
            # THIS IS CRITICAL FOR YOUR "FAILURE VISUALIZATION"
            raise ValueError("Integrity Check Failed: Data has been tampered with.")