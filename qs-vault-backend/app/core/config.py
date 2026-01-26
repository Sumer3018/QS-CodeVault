import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "QS-Vault: Hybrid PQC Gateway"
    API_V1_STR: str = "/api/v1"
    
    # Security Parameters
    # We map these to standard names. If your .env uses 'jwt_secret_key', 
    # Pydantic will now ignore it unless we rename this to match, 
    # but we will stick to standard naming and ignore the extras.
    SECRET_KEY: str = "unsafe_dev_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Cryptographic Configuration
    PQC_ALGORITHM: str = "ML-KEM-512"
    SYMMETRIC_ALGORITHM: str = "AES-256-GCM"
    KDF_ALGORITHM: str = "HKDF-SHA256"
    
    # Storage Configuration
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")
    STORAGE_BACKEND: str = "local" # Options: 'local', 'minio'

    # MinIO Configuration (Added to prevent errors if you want to use them later)
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "qs-vault"

    # Pydantic v2 Configuration
    # extra="ignore" tells Pydantic: "If you see 'jwt_secret_key' in .env 
    # but it's not in this class, just ignore it, don't crash."
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)