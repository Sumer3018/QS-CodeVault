from experiments.baseline_rsa import rsa_encrypt
from app.crypto.crypto_manager import CryptoManager


def run_benchmark(data: bytes):
    pqc = CryptoManager()

    pqc_time = pqc.encrypt_file(data, "test")["ciphertext"]
    rsa_time = rsa_encrypt(data)

    return {
        "pqc": len(pqc_time),
        "rsa_time": rsa_time
    }
