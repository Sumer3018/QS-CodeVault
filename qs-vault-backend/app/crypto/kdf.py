from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import os


def derive_aes_key(shared_secret: bytes, salt: bytes = None):
    # CRITICAL: If no salt provided (Upload), generate one.
    if salt is None:
        salt = os.urandom(16)

    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        info=b'qs-vault-secure-handshake',
    )

    key = hkdf.derive(shared_secret)
    return key, salt
