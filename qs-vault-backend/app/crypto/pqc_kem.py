import time
from pqcrypto.kem.ml_kem_512 import generate_keypair, encrypt, decrypt
# NOTE: 'encrypt' in KEM terms means Encapsulate, 'decrypt' means Decapsulate

class PQCLayer:
    """
    Handles Post-Quantum Key Encapsulation (Kyber-512).
    """
    
    @staticmethod
    def generate_keypair():
        """
        Generates a static PQC public/private keypair for the receiver.
        """
        start_time = time.perf_counter()
        public_key, secret_key = generate_keypair()
        duration = (time.perf_counter() - start_time) * 1000
        
        return {
            "pk": public_key,
            "sk": secret_key,
            "metrics_ms": duration
        }

    @staticmethod
    def encapsulate(public_key: bytes):
        """
        Generates a Shared Secret (SS) and encapsulates it into Ciphertext (CT).
        """
        start_time = time.perf_counter()
        
        # In KEM, 'encrypt' takes a Public Key and returns (Ciphertext, Shared_Secret)
        ciphertext, shared_secret = encrypt(public_key)
        
        duration = (time.perf_counter() - start_time) * 1000
        return {
            "ciphertext": ciphertext,
            "shared_secret": shared_secret,
            "metrics_ms": duration
        }

    @staticmethod
    def decapsulate(ciphertext: bytes, secret_key: bytes):
        """
        Recovers the Shared Secret (SS) using the Secret Key.
        """
        start_time = time.perf_counter()
        
        shared_secret = decrypt(ciphertext, secret_key)
        
        duration = (time.perf_counter() - start_time) * 1000
        return {
            "shared_secret": shared_secret,
            "metrics_ms": duration
        }