# routers/profile.py
import os
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from models.user import User
from models.database import SessionLocal
from services.auth_utils import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/profile", tags=["Profile"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Decode JWT and get user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ✅ Get current user's profile
@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "organization": current_user.organization,
        "profile_pic": current_user.profile_pic,
    }

# ✅ Update user info
@router.put("/update")
def update_profile(
    name: str, phone: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    first_name, *rest = name.split(" ", 1)
    last_name = rest[0] if rest else ""
    current_user.first_name = first_name
    current_user.last_name = last_name
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully", "user": current_user.email}

# ✅ Upload new profile picture
@router.post("/upload-photo")
def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = f"user_{current_user.id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    current_user.profile_pic = f"uploaded_images/{filename}"
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture uploaded successfully",
        "profile_pic": current_user.profile_pic
    }

@router.delete("/remove-photo")
def remove_photo(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    user.profile_pic = None
    db.commit()
    return {"message": "Profile picture removed"}
