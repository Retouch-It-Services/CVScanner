from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from models.database import Base, engine
from routers import auth, profile, analyze
import os

# Initialize FastAPI App

app = FastAPI(title="AI Resume Screener Backend")

# CORS Middleware (Frontend Communication)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5501", "http://localhost:5501", "http://localhost:3000"], # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Tables Creation

Base.metadata.create_all(bind=engine)

# Register Routers

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(analyze.router)

# Static File Directories

os.makedirs("uploaded_images", exist_ok=True)
os.makedirs("uploaded_resumes", exist_ok=True)

# Serve uploaded images (Profile Pictures)
app.mount("/uploaded_images", StaticFiles(directory="uploaded_images"), name="uploaded_images")

# Serve uploaded resumes (AI Analyzer)
app.mount("/uploaded_resumes", StaticFiles(directory="uploaded_resumes"), name="uploaded_resumes")

# Root Endpoint

@app.get("/")
def home():
    return {"message": "✅ AI Resume Screener Backend Running Successfully!"}

from models.analysis import CandidateAnalysis
Base.metadata.create_all(bind=engine)

from routers import candidate_auth
app.include_router(candidate_auth.router)