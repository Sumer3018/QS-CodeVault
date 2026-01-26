from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    PROJECT_NAME = "QS-Vault"
    VERSION = "1.0"

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

    # Storage
    STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local")
    STORAGE_PATH = os.getenv("STORAGE_PATH", "./storage")

    # MinIO
    MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")
    MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
    MINIO_BUCKET = os.getenv("MINIO_BUCKET")

    # Policy
    ALLOW_MACRO_FILES = os.getenv(
        "ALLOW_MACRO_FILES", "true").lower() == "true"


settings = Settings()
