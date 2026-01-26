import uuid
from datetime import datetime

from app.crypto.crypto_manager import CryptoManager
from app.models.file_metadata import FileMetadata


class EncryptionService:

    def __init__(self, storage, user_id: str):
        self.storage = storage
        self.user_id = user_id
        self.crypto = CryptoManager()

    def encrypt_and_store(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str
    ) -> FileMetadata:

        result = self.crypto.encrypt_file(
            file_bytes=file_bytes,
            user_id=self.user_id
        )

        file_id = str(uuid.uuid4())
        storage_path = f"{self.user_id}/{file_id}.enc"

        self.storage.save(storage_path, result["ciphertext"])

        metadata = FileMetadata(
            file_id=file_id,
            owner_id=self.user_id,
            original_filename=filename,
            mime_type=mime_type,
            file_size=len(file_bytes),
            storage_path=storage_path,
            encryption_algorithm="AES-256-GCM",
            kem_algorithm="CRYSTALS-Kyber",
            kdf_algorithm="HKDF-SHA256",
            created_at=datetime.utcnow()
        )

        return metadata
