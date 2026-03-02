from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import files
from app.api import threats
# REMOVED: import auth (Supabase handles this on the client side now)
# REMOVED: database init logic

app = FastAPI(title=settings.PROJECT_NAME)

# --- CORS ---
# Allow your Frontend (localhost:3000) to talk to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTERS ---
# We only need the files router. Login/Register is now handled by Supabase in React.
app.include_router(files.router, prefix="/api/v1", tags=["Files"])
app.include_router(threats.router)

@app.get("/")
def root():
    return {
        "system": "QS-Vault Gateway",
        "status": "Operational",
        "backend": "Stateless (Supabase)",
        "algorithm": settings.PQC_ALGORITHM
    }


if __name__ == "__main__":
    import uvicorn
    # Make sure you are running this from the parent folder of 'app'
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
