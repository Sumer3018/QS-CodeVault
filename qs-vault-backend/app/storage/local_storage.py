import os
from .base import StorageBackend


class LocalStorage(StorageBackend):

    def __init__(self, base_path: str):
        self.base_path = base_path
        os.makedirs(self.base_path, exist_ok=True)

    def save(self, path: str, data: bytes):
        full_path = os.path.join(self.base_path, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "wb") as f:
            f.write(data)

    def load(self, path: str) -> bytes:
        full_path = os.path.join(self.base_path, path)
        with open(full_path, "rb") as f:
            return f.read()
