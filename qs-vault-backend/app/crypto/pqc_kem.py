import time
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives import serialization


class PQCLayer:
    """
    KEM implemented using X25519.
    Deterministic, serializable, restart-safe.
    """

    # ==============================
    # KEY GENERATION
    # ==============================
    @staticmethod
    def generate_keypair():
        start = time.perf_counter()

        sk = x25519.X25519PrivateKey.generate()
        pk = sk.public_key()

        duration = (time.perf_counter() - start) * 1000

        return {
            "pk": pk.public_bytes(
                encoding=serialization.Encoding.Raw,
                format=serialization.PublicFormat.Raw
            ),
            "sk": sk.private_bytes(
                encoding=serialization.Encoding.Raw,
                format=serialization.PrivateFormat.Raw,
                encryption_algorithm=serialization.NoEncryption()
            ),
            "metrics_ms": duration
        }

    # ==============================
    # ENCAPSULATION
    # ==============================
    @staticmethod
    def encapsulate(public_key: bytes):
        start = time.perf_counter()

        receiver_pk = x25519.X25519PublicKey.from_public_bytes(public_key)
        ephemeral_sk = x25519.X25519PrivateKey.generate()

        shared_secret = ephemeral_sk.exchange(receiver_pk)

        # ⭐ SERIALIZE EXPLICITLY ⭐
        ciphertext = ephemeral_sk.public_key().public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

        duration = (time.perf_counter() - start) * 1000

        return {
            "ciphertext": ciphertext,
            "shared_secret": shared_secret,
            "metrics_ms": duration
        }

    # ==============================
    # DECAPSULATION
    # ==============================
    @staticmethod
    def decapsulate(ciphertext: bytes, secret_key: bytes):
        start = time.perf_counter()

        sk = x25519.X25519PrivateKey.from_private_bytes(secret_key)
        peer_pk = x25519.X25519PublicKey.from_public_bytes(ciphertext)

        shared_secret = sk.exchange(peer_pk)

        duration = (time.perf_counter() - start) * 1000

        return {
            "shared_secret": shared_secret,
            "metrics_ms": duration
        }
