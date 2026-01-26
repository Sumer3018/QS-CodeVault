from fastapi import APIRouter, HTTPException
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.models.user import User
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

USERS_DB = {}


@router.post("/register")
def register(username: str, password: str):
    if username in USERS_DB:
        raise HTTPException(status_code=400, detail="User exists")

    user = User(
        user_id=str(uuid.uuid4()),
        username=username,
        hashed_password=hash_password(password)
    )

    USERS_DB[username] = user
    return {"message": "registered"}


@router.post("/login")
def login(username: str, password: str):
    user = USERS_DB.get(username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.user_id)
    return {"access_token": token, "token_type": "bearer"}
