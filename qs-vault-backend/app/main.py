from fastapi import FastAPI
from app.api import auth, files

app = FastAPI(title="QS-Vault")

app.include_router(auth.router)
app.include_router(files.router)
