from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
import os

from .database import get_db

# Security Config
SECRET_KEY = "HACKATHON_SECRET" # Ideally from env
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["auth"])

class UserLogin(BaseModel):
    email: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str

# Mock User DB for simplicity (or use SQL users table if preferred)
# For Hackathon speed, let's just accept any user but require specific credentials for roles?
# Actually, let's make it accept ANY email/password and just return a token,
# unless specific "admin" email is used.
# User wants "Success -> save user info".

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    # Mock Authentication Logic
    # In a real app: verify password hash from DB
    
    role = "supplier"
    if "admin" in user.email:
        role = "retailer" # The "Control Tower" user
        
    # Create Token
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"sub": user.email, "role": role, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "user_role": role
    }

@router.post("/register", response_model=Token)
def register(user: UserLogin):
    # Mock Registration
    # Just return a token
    return login(user)
