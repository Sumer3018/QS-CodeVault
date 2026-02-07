import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "QS-Vault: Hybrid PQC Gateway"
    API_V1_STR: str = "/api/v1"

    # --- SUPABASE CONFIGURATION (REQUIRED) ---
    # These must be in your .env file
    SUPABASE_URL: str = "https://vypkflbxvzwsfedbtwxi.supabase.co"
    SUPABASE_KEY: str = "eeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cGtmbGJ4dnp3c2ZlZGJ0d3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM5MzMwMywiZXhwIjoyMDg1OTY5MzAzfQ.1krLtdIUbQnreD6x3EmAoV50FFAbgUvkjR7uWCAd1dI"

    # --- CRYPTOGRAPHIC CONFIGURATION ---
    # (Kept from your original code)
    PQC_ALGORITHM: str = "ML-KEM-512"
    SYMMETRIC_ALGORITHM: str = "AES-256-GCM"
    KDF_ALGORITHM: str = "HKDF-SHA256"

    # --- STORAGE CONFIGURATION ---
    # We still need a temp folder for processing uploads before sending to cloud
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")

    # --- CONFIG LOADING ---
    # 'extra="ignore"' prevents crashes if your .env still has old keys like MINIO_*
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

# Ensure temp directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
