from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from models.database import Base

class CandidateAnalysis(Base):
    __tablename__ = "candidate_analysis"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    experience = Column(String, nullable=True)
    skills = Column(Text, nullable=True)
    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    match_score = Column(Float, nullable=False)
    skill_match_percent = Column(Float, nullable=True)
    fit_status = Column(String, nullable=True)
    cover_letter = Column(Text, nullable=True)
    resume_name = Column(String, nullable=True)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
