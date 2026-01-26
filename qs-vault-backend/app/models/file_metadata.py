from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FileMetadata(BaseModel):
    file_id: str
    owner_id: str

    original_filename: str
    mime_type: str
    file_size: int

    storage_path: str

    encryption_algorithm: str
    kem_algorithm: str
    kdf_algorithm: str

    created_at: datetime
