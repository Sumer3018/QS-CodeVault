class KeyVault:
    _store = {}

    @classmethod
    def put(cls, key_id: str, secret_key: bytes):
        cls._store[key_id] = secret_key

    @classmethod
    def get(cls, key_id: str):
        return cls._store.get(key_id)
