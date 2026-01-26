from minio import Minio
from app.core.config import settings


class MinioStorage:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False,
        )
        if not self.client.bucket_exists(settings.MINIO_BUCKET):
            self.client.make_bucket(settings.MINIO_BUCKET)

    def save(self, path: str, data: bytes):
        from io import BytesIO
        self.client.put_object(
            settings.MINIO_BUCKET,
            path,
            BytesIO(data),
            length=len(data)
        )

    def load(self, path: str) -> bytes:
        response = self.client.get_object(settings.MINIO_BUCKET, path)
        return response.read()
