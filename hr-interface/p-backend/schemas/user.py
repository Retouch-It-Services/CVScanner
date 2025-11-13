from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class VerifyOtpCompleteRequest(BaseModel):
    email: EmailStr
    otp: str
    password: str
    organization: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
