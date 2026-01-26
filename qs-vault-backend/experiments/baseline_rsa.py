from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
import os
import time


def rsa_encrypt(data: bytes):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    start = time.time()
    ciphertext = key.public_key().encrypt(
        data,
        padding.OAEP(
            mgf=padding.MGF1(hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return time.time() - start
