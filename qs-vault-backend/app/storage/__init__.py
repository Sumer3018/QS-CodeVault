from app.core.config import settings
from .local_storage import LocalStorage
from .minio_storage import MinioStorage


def get_storage():
    if settings.STORAGE_BACKEND == "minio":
        return MinioStorage()
    return LocalStorage(settings.STORAGE_PATH)
