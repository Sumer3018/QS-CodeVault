from abc import ABC, abstractmethod


class StorageBackend(ABC):

    @abstractmethod
    def save(self, path: str, data: bytes):
        pass

    @abstractmethod
    def load(self, path: str) -> bytes:
        pass
