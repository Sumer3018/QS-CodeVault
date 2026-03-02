import os
from app.crypto.pqc_kem import PQCLayer

KEY_DIR = "server_identity"
os.makedirs(KEY_DIR, exist_ok=True)

VARIANTS = ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"]

SERVER_KEYS = {}


def load_or_create_variant(variant: str):
    pk_file = os.path.join(KEY_DIR, f"{variant}_public.key")
    sk_file = os.path.join(KEY_DIR, f"{variant}_secret.key")

    if os.path.exists(pk_file) and os.path.exists(sk_file):
        print(f"🔐 Loading server identity for {variant}...")
        with open(pk_file, "rb") as f:
            pk = f.read()
        with open(sk_file, "rb") as f:
            sk = f.read()
        return pk, sk

    print(f"🔐 Generating NEW server identity for {variant}...")
    keys = PQCLayer.generate_keypair(variant)

    with open(pk_file, "wb") as f:
        f.write(keys["pk"])

    with open(sk_file, "wb") as f:
        f.write(keys["sk"])

    return keys["pk"], keys["sk"]


# Load or generate all variants
for variant in VARIANTS:
    pk, sk = load_or_create_variant(variant)
    SERVER_KEYS[variant] = {
        "pk": pk,
        "sk": sk
    }

print("✅ All ML-KEM server identities ready.")
