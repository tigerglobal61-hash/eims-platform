from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth.users import USERS
from app.auth.security import create_access_token

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(request: LoginRequest):
    username = request.username.strip()

    user = USERS.get(username)

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if request.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(
        username=username,
        role=user["role"],
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": username,
        "role": user["role"],
    }
