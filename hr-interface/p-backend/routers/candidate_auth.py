from datetime import datetime, timedelta
import random, string
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from models.database import SessionLocal
from models.candidate import Candidate
from services.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/candidate/auth", tags=["Candidate Auth"])

# memory otp store
otps = {}      # otps[email] = {"otp":..., "expires_at":..., "verified":False}
OTP_EXP_MIN = 3


class SignupStep1(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class VerifyOtp(BaseModel):
    email: EmailStr
    otp: str

class CompleteSignup(BaseModel):
    email: EmailStr
    password: str


class LoginReq(BaseModel):
    email: EmailStr
    password: str


def gen_otp():
    return "".join(random.choices(string.digits, k=6))

def now():
    return datetime.utcnow()

# DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 1 send otp
@router.post("/signup")
def send_signup(payload: SignupStep1, db:Session=Depends(get_db)):
    email = payload.email.lower()

    # if exists candidate already
    if db.query(Candidate).filter(Candidate.email==email).first():
        raise HTTPException(400,"Email already registered")

    otp = gen_otp()
    otps[email] = {
        "otp": otp,
        "expires_at": now() + timedelta(minutes=OTP_EXP_MIN),
        "verified": False,
        "first_name": payload.first_name,
        "last_name": payload.last_name
    }

    # NOTE: send email same place you send HR OTP (same email_service)
    from routers.auth import _send_otp_email
    _send_otp_email(email, otp)

    return {"message":"OTP sent"}

# 2 verify
@router.post("/verify-otp")
def verify(payload:VerifyOtp):
    email = payload.email.lower()
    entry = otps.get(email)
    if not entry:
        raise HTTPException(400,"Start signup first")

    if now() > entry["expires_at"]:
        raise HTTPException(400,"OTP expired")

    if payload.otp != entry["otp"]:
        raise HTTPException(400,"Invalid OTP")

    entry["verified"] = True
    return {"message":"OTP verified"}


# 3 complete signup
@router.post("/complete-signup")
def complete(payload:CompleteSignup, db:Session=Depends(get_db)):
    email = payload.email.lower()
    entry = otps.get(email)

    if not entry or not entry["verified"]:
        raise HTTPException(400,"Verify OTP first")

    user = Candidate(
        first_name=entry["first_name"],
        last_name=entry["last_name"],
        email=email,
        password=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    otps.pop(email,None)

    return {"message":"Candidate signup completed"}


# LOGIN
@router.post("/login")
def login(payload:LoginReq, db:Session=Depends(get_db)):
    user = db.query(Candidate).filter(Candidate.email==payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Invalid credentials")

    token = create_access_token({"sub":payload.email.lower(),"role":"candidate"})
    return {"access_token":token,"token_type":"bearer"}