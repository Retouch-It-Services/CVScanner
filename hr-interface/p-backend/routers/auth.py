# p-backend/routers/auth.py
from datetime import datetime, timedelta
import os
import random
import string
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from models.database import SessionLocal
from models.user import User
from services.auth_utils import (
    hash_password, verify_password,
    create_access_token, decode_access_token
)

# --- Try email service (your existing one). If missing, print OTP to console ---
try:
    from services.email_service import send_otp_email as send_otp_email_service
    HAVE_EMAIL_SERVICE = True
except Exception:
    HAVE_EMAIL_SERVICE = False

router = APIRouter(prefix="/auth", tags=["Auth"])
bearer = HTTPBearer()

# =========================
# In-memory OTP store
# =========================
# otps[email] = {
#   "first_name": str,
#   "last_name": str,
#   "email": str,
#   "otp": str,
#   "expires_at": datetime,
#   "cooldown_until": datetime,
#   "resend_count": int,
#   "verified": bool,
#   "password_hash": Optional[str],   # set after complete-signup
#   "organization": Optional[str]     # set after complete-signup
# }
otps: Dict[str, Dict[str, Any]] = {}

OTP_EXP_MINUTES = 3          # <- as requested
RESEND_COOLDOWN_SECONDS = 60 # <- as requested
MAX_RESENDS = 3              # total resends allowed after first send

# =========================
# Pydantic payloads
# =========================
class SignupStep1Request(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class ResendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class CompleteSignupRequest(BaseModel):
    email: EmailStr
    password: str
    organization: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# =========================
# DB session
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# Helpers
# =========================
def _gen_otp(n: int = 6) -> str:
    return "".join(random.choices(string.digits, k=n))

def _send_otp_email(to_email: str, otp: str):
    if HAVE_EMAIL_SERVICE:
        send_otp_email_service(to_email, otp)
    else:
        print(f"⚠️ [DEV ONLY] OTP for {to_email}: {otp}")

def _now() -> datetime:
    return datetime.utcnow()

# 1) SEND OTP  (first_name, last_name, email)

@router.post("/signup", status_code=200)
def signup_send_otp(payload: SignupStep1Request, db: Session = Depends(get_db)):
    email = payload.email.lower()

    # If user already exists in DB
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = _gen_otp()
    otps[email] = {
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "email": email,
        "otp": otp,
        "expires_at": _now() + timedelta(minutes=OTP_EXP_MINUTES),
        "cooldown_until": _now() + timedelta(seconds=RESEND_COOLDOWN_SECONDS),
        "resend_count": 0,
        "verified": False,
        "password_hash": None,
        "organization": None,
    }

    _send_otp_email(email, otp)
    return {
        "message": "OTP sent to email",
        "cooldown_seconds": RESEND_COOLDOWN_SECONDS,
        "expires_in_seconds": OTP_EXP_MINUTES * 60,
        "max_resends": MAX_RESENDS
    }

# 1b) RESEND OTP (email only) – 60s cooldown, 3 resends max

@router.post("/resend-otp", status_code=200)
def resend_otp(payload: ResendOtpRequest):
    email = payload.email.lower()
    entry = otps.get(email)
    if not entry:
        raise HTTPException(status_code=400, detail="Start signup first")

    now = _now()
    if now < entry["cooldown_until"]:
        remain = int((entry["cooldown_until"] - now).total_seconds())
        raise HTTPException(status_code=429, detail=f"Please wait {remain}s before resending")

    if entry["resend_count"] >= MAX_RESENDS:
        raise HTTPException(status_code=429, detail="Resend limit reached")

    # generate new otp, refresh expiry & cooldown
    new_otp = _gen_otp()
    entry["otp"] = new_otp
    entry["expires_at"] = now + timedelta(minutes=OTP_EXP_MINUTES)
    entry["cooldown_until"] = now + timedelta(seconds=RESEND_COOLDOWN_SECONDS)
    entry["resend_count"] += 1

    _send_otp_email(email, new_otp)

    return {
        "message": "OTP resent",
        "remaining_resends": MAX_RESENDS - entry["resend_count"],
        "cooldown_seconds": RESEND_COOLDOWN_SECONDS,
        "expires_in_seconds": OTP_EXP_MINUTES * 60
    }

# =========================
# 2) VERIFY OTP (email, otp)
# =========================
@router.post("/verify-otp", status_code=200)
def verify_otp(payload: VerifyOtpRequest):
    email = payload.email.lower()
    entry = otps.get(email)
    if not entry:
        raise HTTPException(status_code=400, detail="Start signup first")

    if _now() > entry["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired")

    if payload.otp != entry["otp"]:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    entry["verified"] = True
    return {"message": "OTP verified. You can complete signup now."}

# =========================
# 3) COMPLETE SIGNUP (email, password, organization)
# =========================
@router.post("/complete-signup", status_code=201)
def complete_signup(payload: CompleteSignupRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    entry = otps.get(email)
    if not entry or not entry.get("verified"):
        raise HTTPException(status_code=400, detail="Verify OTP first")

    # Double check not created in the meantime
    if db.query(User).filter(User.email == email).first():
        # consume memory entry to avoid stale
        otps.pop(email, None)
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        first_name=entry["first_name"],
        last_name=entry["last_name"],
        email=email,
        password=hash_password(payload.password),
        organization=payload.organization.strip(),
        role="hr",  # <- always HR
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # cleanup memory entry
    otps.pop(email, None)

    return {"message": "Signup completed", "email": email, "user_id": user.id}

# =========================
# LOGIN / ME (unchanged logic)
# =========================
@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def read_me(token: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)):
    jwt = token.credentials
    payload = decode_access_token(jwt)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "organization": user.organization,
    }


# =========================
# FORGOT PASSWORD FLOW
# =========================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyForgotOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


# Send OTP for password reset
@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = req.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")

    otp = _gen_otp()
    expires_at = _now() + timedelta(minutes=OTP_EXP_MINUTES)

    # Reuse signup OTP structure
    otps[email] = {
        "email": email,
        "otp": otp,
        "expires_at": expires_at,
        "verified": False,
    }

    _send_otp_email(email, otp)
    return {
        "message": "OTP sent to your registered email",
        "expires_in_seconds": OTP_EXP_MINUTES * 60,
    }


# Verify OTP for forgot password
@router.post("/verify-forgot-otp")
def verify_forgot_otp(req: VerifyForgotOtpRequest):
    email = req.email.lower()
    entry = otps.get(email)
    if not entry:
        raise HTTPException(status_code=400, detail="Request OTP first")
    if _now() > entry["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired")
    if req.otp != entry["otp"]:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    entry["verified"] = True
    return {"message": "OTP verified successfully"}


# Reset password after OTP verification
@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = req.email.lower()
    entry = otps.get(email)
    if not entry or not entry.get("verified"):
        raise HTTPException(status_code=400, detail="Verify OTP first")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(req.new_password)
    db.commit()

    # Clean up memory
    otps.pop(email, None)

    return {"message": "Password reset successfully"}
