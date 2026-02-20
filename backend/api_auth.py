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
def login(user: UserLogin, db: Session = Depends(get_db)):
    from .models_v2 import User
    
    # 1. Fetch User
    db_user = db.query(User).filter(User.email == user.email).first()
    
    # 2. Verify Password (Plaintext for prototype)
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Create Token
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {
        "sub": db_user.email,
        "role": db_user.role,
        "user_id": db_user.user_id,
        "company": db_user.company_name,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "user_role": db_user.role
    }

@router.post("/register", response_model=Token)
def register(user: UserLogin):
    # Mock Registration
    # Just return a token
    return login(user)
