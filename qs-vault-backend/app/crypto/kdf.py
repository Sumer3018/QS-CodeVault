from Crypto.Protocol.KDF import HKDF
from Crypto.Hash import SHA256
from Crypto.Random import get_random_bytes

def derive_aes_key(shared_secret: bytes, salt: bytes = None) -> bytes:
    """
    Derives a 32-byte (256-bit) AES key from the PQC shared secret.
    Uses HKDF-SHA256.
    """
    if not salt:
        salt = get_random_bytes(16) # Random salt for uniqueness
        
    # Master Secret -> 32 bytes AES Key
    key = HKDF(
        master=shared_secret,
        key_len=32,
        salt=salt,
        hashmod=SHA256
    )
    return key, salt