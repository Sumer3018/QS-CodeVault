import os
from app.crypto.pqc_kem import PQCLayer

KEY_DIR = "server_identity"
PK_FILE = os.path.join(KEY_DIR, "public.key")
SK_FILE = os.path.join(KEY_DIR, "secret.key")

os.makedirs(KEY_DIR, exist_ok=True)


def load_or_create():
    if os.path.exists(PK_FILE) and os.path.exists(SK_FILE):
        print("🔐 Loading server identity...")
        with open(PK_FILE, "rb") as f:
            pk = f.read()
        with open(SK_FILE, "rb") as f:
            sk = f.read()
        return pk, sk

    print("🔐 Generating NEW server identity...")
    keys = PQCLayer.generate_keypair()

    with open(PK_FILE, "wb") as f:
        f.write(keys["pk"])

    with open(SK_FILE, "wb") as f:
        f.write(keys["sk"])

    return keys["pk"], keys["sk"]


SERVER_PUBLIC_KEY, SERVER_SECRET_KEY = load_or_create()

print("✅ Server identity ready.")
