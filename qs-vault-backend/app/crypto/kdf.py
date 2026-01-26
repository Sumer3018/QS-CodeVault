from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes


class KeyDerivation:
    @staticmethod
    def derive_aes_key(shared_secret: bytes, salt: bytes) -> bytes:
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            info=b"QS-Vault-AES-Key",
        )
        return hkdf.derive(shared_secret)
