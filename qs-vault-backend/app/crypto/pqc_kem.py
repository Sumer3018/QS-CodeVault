from pqcrypto.kem.frodo640aes import (
    generate_keypair,
    encrypt,
    decrypt,
)

class PQCKEM:
    """
    Post-Quantum Key Encapsulation using FrodoKEM-640-AES.
    Selected for software-only reproducibility on commodity systems.
    """

    @staticmethod
    def generate_keypair():
        public_key, private_key = generate_keypair()
        return public_key, private_key

    @staticmethod
    def encapsulate(public_key: bytes):
        ciphertext, shared_secret = encrypt(public_key)
        return ciphertext, shared_secret

    @staticmethod
    def decapsulate(ciphertext: bytes, private_key: bytes):
        shared_secret = decrypt(ciphertext, private_key)
        return shared_secret
