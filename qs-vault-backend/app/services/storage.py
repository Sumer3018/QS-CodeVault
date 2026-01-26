import os
from app.core.config import settings

class StorageService:
    @staticmethod
    def save(filename: str, data: bytes):
        """Saves bytes to the configured backend."""
        if settings.STORAGE_BACKEND == "local":
            path = os.path.join(settings.UPLOAD_DIR, filename)
            with open(path, "wb") as f:
                f.write(data)
        elif settings.STORAGE_BACKEND == "minio":
            # Placeholder for MinIO logic (add if you need it later)
            pass

    @staticmethod
    def get(filename: str) -> bytes:
        """Retrieves bytes."""
        if settings.STORAGE_BACKEND == "local":
            path = os.path.join(settings.UPLOAD_DIR, filename)
            if not os.path.exists(path):
                raise FileNotFoundError("Cloud object missing")
            with open(path, "rb") as f:
                return f.read()