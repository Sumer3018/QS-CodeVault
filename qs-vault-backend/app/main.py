from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api import files, auth
from app.core.database import init_db

# --- DATABASE INITIALIZATION ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs BEFORE the server accepts requests
    print("🔄 Initializing Database Tables...")
    init_db()
    print("✅ Database Tables Created!")
    yield
    # This runs when server shuts down (optional cleanup)

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# CORS (Allow Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(files.router, prefix="/api/v1/files", tags=["Files"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])

@app.get("/")
def root():
    return {
        "system": "QS-Vault Gateway",
        "status": "Secure",
        "pqc_enabled": True,
        "algorithm": settings.PQC_ALGORITHM
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)