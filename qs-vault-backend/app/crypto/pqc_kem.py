import time
import oqs


class PQCLayer:
    """
    ML-KEM (FIPS 203) implementation using liboqs.
    Production-safe, restart-safe, metrics-aware.
    Compatible with existing QS-Vault architecture.
    """

    # Default variant (can be overridden if needed)
    VARIANT = "ML-KEM-768"

    # ==============================
    # INTERNAL VALIDATION
    # ==============================
    @staticmethod
    def _validate_variant(variant: str):
        enabled = oqs.get_enabled_kem_mechanisms()
        if variant not in enabled:
            raise ValueError(
                f"Unsupported ML-KEM variant '{variant}'. "
                f"Available: {enabled}"
            )

    # ==============================
    # KEY GENERATION
    # ==============================
    @staticmethod
    def generate_keypair(variant: str = None):
        variant = variant or PQCLayer.VARIANT
        PQCLayer._validate_variant(variant)

        start = time.perf_counter()

        try:
            with oqs.KeyEncapsulation(variant) as kem:
                public_key = kem.generate_keypair()
                secret_key = kem.export_secret_key()
        except Exception as e:
            raise RuntimeError(f"ML-KEM key generation failed: {str(e)}")

        duration = (time.perf_counter() - start) * 1000

        return {
            "pk": public_key,
            "sk": secret_key,
            "metrics_ms": duration
        }

    # ==============================
    # ENCAPSULATION
    # ==============================
    @staticmethod
    def encapsulate(public_key: bytes, variant: str = None):
        variant = variant or PQCLayer.VARIANT
        PQCLayer._validate_variant(variant)

        if not isinstance(public_key, (bytes, bytearray)):
            raise TypeError("Public key must be bytes")

        start = time.perf_counter()

        try:
            with oqs.KeyEncapsulation(variant) as kem:
                ciphertext, shared_secret = kem.encap_secret(public_key)
        except Exception as e:
            raise RuntimeError(f"ML-KEM encapsulation failed: {str(e)}")

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
    def decapsulate(ciphertext: bytes, secret_key: bytes, variant: str = None):
        variant = variant or PQCLayer.VARIANT
        PQCLayer._validate_variant(variant)

        if not isinstance(ciphertext, (bytes, bytearray)):
            raise TypeError("Ciphertext must be bytes")

        if not isinstance(secret_key, (bytes, bytearray)):
            raise TypeError("Secret key must be bytes")

        start = time.perf_counter()

        try:
            # 🔥 CORRECT API FOR YOUR INSTALLED VERSION
            with oqs.KeyEncapsulation(variant, secret_key) as kem:
                shared_secret = kem.decap_secret(ciphertext)
        except Exception as e:
            raise RuntimeError(f"ML-KEM decapsulation failed: {str(e)}")

        duration = (time.perf_counter() - start) * 1000

        return {
            "shared_secret": shared_secret,
            "metrics_ms": duration
        }
