from app.storage import get_storage


class StorageService:
    def __init__(self):
        self.storage = get_storage()

    def save(self, path: str, data: bytes):
        self.storage.save(path, data)

    def load(self, path: str) -> bytes:
        return self.storage.load(path)
