# app/services/file_repository.py

from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_last_file():
    """
    Returns latest encrypted file from storage.
    """

    res = (
        supabase.table("files")
        .select("*")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not res.data:
        raise Exception("No files available")

    f = res.data[0]

    # 🔥 DOWNLOAD FROM STORAGE
    bucket = "encrypted_vault"   # ⚠️ change if your bucket name different
    path = f["storage_path"]

    download = supabase.storage.from_(bucket).download(path)

    blob = download

    return {
        "blob": blob,
        "metadata": {
            "pqc_ciphertext_cap": f["pqc_ciphertext_cap"]
        }
    }
