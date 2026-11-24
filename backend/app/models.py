import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from .database import Base


class Skill(Base):
    __tablename__ = "canonical_skills"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    aliases = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)
    description = Column(Text, nullable=True)


class RoleProfile(Base):
    __tablename__ = "role_profiles"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(JSON, default=list)  # list of {skill_id, weight, importance, min_threshold, description}


class CuratedRecommendation(Base):
    __tablename__ = "curated_recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(String(100), index=True, nullable=False)
    title = Column(String(250), nullable=False)
    objective = Column(Text, nullable=False)
    topics = Column(JSON, default=list)
    official_docs = Column(String(500), nullable=False)
    practice_tasks = Column(JSON, default=list)
    artifacts = Column(Text, nullable=False)
    estimated_hours = Column(Integer, default=15)
    difficulty = Column(String(50), default="Intermediate")


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(50), primary_key=True, index=True)
    candidate_name = Column(String(200), default="Candidate")
    role_profile_id = Column(String(100), nullable=True)
    role_profile_title = Column(String(200), nullable=False)
    source_type = Column(String(50), default="text")  # pdf, docx, text
    gap_index = Column(Float, nullable=False)  # 0.0 to 1.0 (or 0 to 100%)
    overall_match_score = Column(Float, nullable=False)  # weighted match score (1 - gap_index)
    strong_matches_count = Column(Integer, default=0)
    partial_matches_count = Column(Integer, default=0)
    missing_skills_count = Column(Integer, default=0)
    extracted_skills = Column(JSON, default=list)
    match_breakdown = Column(JSON, default=list)  # detailed evidence table
    recommendations = Column(JSON, default=list)  # prioritized roadmap
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
