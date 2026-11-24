import json
import os
import uuid
import datetime
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db, SessionLocal
from .models import Skill, RoleProfile, CuratedRecommendation, AnalysisRun
from .schemas import (
    SkillResponse,
    RoleProfileResponse,
    AnalysisResponse,
    AnalysisHistoryItem,
    ExtractedSkillItem,
    MatchBreakdownItem,
    LearningRoadmapItem,
)
from .services.parser import parse_document, preserve_clean_text
from .services.extractor import extract_skills_from_text, get_skills_catalog
from .services.matcher import compute_skill_matches
from .services.recommender import generate_learning_roadmap


def seed_database(db: Session):
    """Seeds canonical skills, role profiles, and recommendations from JSON files."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")

    # 1. Seed Skills Catalog
    if db.query(Skill).count() == 0:
        skills_file = os.path.join(data_dir, "skills_catalog.json")
        if os.path.exists(skills_file):
            with open(skills_file, "r", encoding="utf-8") as f:
                skills_data = json.load(f)
                for item in skills_data:
                    skill = Skill(
                        id=item["id"],
                        name=item["name"],
                        category=item["category"],
                        aliases=item.get("aliases", []),
                        prerequisites=item.get("prerequisites", []),
                        description=item.get("description", ""),
                    )
                    db.add(skill)
            db.commit()

    # 2. Seed Role Profiles
    if db.query(RoleProfile).count() == 0:
        roles_file = os.path.join(data_dir, "role_profiles.json")
        if os.path.exists(roles_file):
            with open(roles_file, "r", encoding="utf-8") as f:
                roles_data = json.load(f)
                for item in roles_data:
                    role = RoleProfile(
                        id=item["id"],
                        title=item["title"],
                        description=item.get("description", ""),
                        requirements=item.get("requirements", []),
                    )
                    db.add(role)
            db.commit()

    # 3. Seed Curated Recommendations
    if db.query(CuratedRecommendation).count() == 0:
        recs_file = os.path.join(data_dir, "recommendations.json")
        if os.path.exists(recs_file):
            with open(recs_file, "r", encoding="utf-8") as f:
                recs_data = json.load(f)
                for item in recs_data:
                    rec = CuratedRecommendation(
                        skill_id=item["skill_id"],
                        title=item["title"],
                        objective=item["objective"],
                        topics=item.get("topics", []),
                        official_docs=item["official_docs"],
                        practice_tasks=item.get("practice_tasks", []),
                        artifacts=item["artifacts"],
                        estimated_hours=item.get("estimated_hours", 15),
                        difficulty=item.get("difficulty", "Intermediate"),
                    )
                    db.add(rec)
            db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Run startup seeding
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="AI-Based Skill Gap Analyzer API",
    description="Deterministic career skill assessment and explainable recommendation decision-support backend.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "AI-Based Skill Gap Analyzer",
    }


@app.get("/api/skills", response_model=List[SkillResponse])
def get_canonical_skills(db: Session = Depends(get_db)):
    """Retrieves all canonical skills catalogued in the system."""
    skills = db.query(Skill).order_by(Skill.category, Skill.name).all()
    if not skills:
        return get_skills_catalog()
    return skills


@app.get("/api/roles", response_model=List[RoleProfileResponse])
def get_role_profiles(db: Session = Depends(get_db)):
    """Retrieves predefined target career role profiles."""
    roles = db.query(RoleProfile).all()
    if not roles:
        roles_file = os.path.join(os.path.dirname(__file__), "data", "role_profiles.json")
        if os.path.exists(roles_file):
            with open(roles_file, "r", encoding="utf-8") as f:
                return json.load(f)
    return roles


@app.get("/api/roles/{role_id}", response_model=RoleProfileResponse)
def get_role_profile(role_id: str, db: Session = Depends(get_db)):
    """Retrieves a specific role profile by ID."""
    role = db.query(RoleProfile).filter(RoleProfile.id == role_id).first()
    if not role:
        roles_file = os.path.join(os.path.dirname(__file__), "data", "role_profiles.json")
        if os.path.exists(roles_file):
            with open(roles_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for r in data:
                    if r["id"] == role_id:
                        return r
        raise HTTPException(status_code=404, detail="Role profile not found")
    return role


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_candidate_skills(
    candidate_name: Optional[str] = Form("Candidate"),
    role_profile_id: Optional[str] = Form("backend_developer"),
    resume_text: Optional[str] = Form(None),
    custom_job_description: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Main Skill Gap Analysis pipeline:
    1. Parse resume text from uploaded PDF/DOCX or pasted text.
    2. Extract skills using hybrid spaCy PhraseMatcher + noun-chunk fallback.
    3. Evaluate against selected role profile or custom JD via Sentence-BERT + exact matcher.
    4. Calculate Role Skill-Gap Index (G).
    5. Generate prioritized, traceable learning roadmap.
    6. Persist run to database for audit history.
    """
    source_type = "text"
    raw_text = ""

    # Handle document upload if provided
    if resume_file and resume_file.filename:
        file_bytes = await resume_file.read()
        if len(file_bytes) > 0:
            raw_text, source_type = parse_document(file_bytes, resume_file.filename)

    # Fallback to pasted text if no file or empty file
    if not raw_text.strip() and resume_text:
        raw_text = preserve_clean_text(resume_text)
        source_type = "text"

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume content provided. Please upload a PDF/DOCX resume or paste resume text.",
        )

    # 1. Extract Candidate Skills
    extracted_raw = extract_skills_from_text(raw_text)

    # 2. Determine Target Role Requirements
    role_title = "Custom Job Profile"
    role_requirements = []

    if custom_job_description and custom_job_description.strip():
        # Custom Job Description path: extract requirements dynamically
        jd_skills = extract_skills_from_text(custom_job_description)
        if not jd_skills:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract technical skill requirements from the provided custom job description. Please provide a more detailed job description or select a predefined role.",
            )
        role_title = "Custom Job Description Analysis"
        n = len(jd_skills)
        w = round(1.0 / n, 3)
        for s in jd_skills:
            role_requirements.append({
                "skill_id": s["skill_id"],
                "weight": w,
                "importance": "Important",
                "min_threshold": 0.60,
                "description": f"Extracted requirement from custom job specification: {s['name']}",
            })
    else:
        # Predefined Role Profile path
        role = db.query(RoleProfile).filter(RoleProfile.id == role_profile_id).first()
        if role:
            role_title = role.title
            role_requirements = role.requirements
        else:
            # Fallback to JSON
            roles_file = os.path.join(os.path.dirname(__file__), "data", "role_profiles.json")
            if os.path.exists(roles_file):
                with open(roles_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for r in data:
                        if r["id"] == role_profile_id:
                            role_title = r["title"]
                            role_requirements = r["requirements"]
                            break

        if not role_requirements:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role profile '{role_profile_id}' not found.",
            )

    # 3. Match Skills and Compute Gap Index G
    breakdown, gap_index_G, counts = compute_skill_matches(
        extracted_candidate_skills=extracted_raw,
        role_requirements=role_requirements,
        resume_text=raw_text,
    )

    # 4. Generate Prioritized Traceable Roadmap
    roadmap = generate_learning_roadmap(
        match_breakdown=breakdown,
        candidate_skills=extracted_raw,
    )

    # 5. Persist run to database
    run_id = f"run_{uuid.uuid4().hex[:10]}"
    now_dt = datetime.datetime.utcnow()
    overall_score = round((1.0 - gap_index_G) * 100, 1)

    analysis_run = AnalysisRun(
        id=run_id,
        candidate_name=candidate_name or "Candidate",
        role_profile_id=role_profile_id if not custom_job_description else "custom",
        role_profile_title=role_title,
        source_type=source_type,
        gap_index=gap_index_G,
        overall_match_score=overall_score,
        strong_matches_count=counts["strong"],
        partial_matches_count=counts["partial"],
        missing_skills_count=counts["missing"],
        extracted_skills=extracted_raw,
        match_breakdown=breakdown,
        recommendations=roadmap,
        created_at=now_dt,
    )
    db.add(analysis_run)
    db.commit()

    return AnalysisResponse(
        id=run_id,
        candidate_name=candidate_name or "Candidate",
        role_profile_title=role_title,
        source_type=source_type,
        gap_index=gap_index_G,
        gap_index_percentage=round(gap_index_G * 100, 1),
        overall_match_score=overall_score,
        strong_matches_count=counts["strong"],
        partial_matches_count=counts["partial"],
        missing_skills_count=counts["missing"],
        total_requirements_count=counts["total"],
        extracted_skills=[ExtractedSkillItem(**s) for s in extracted_raw],
        match_breakdown=[MatchBreakdownItem(**m) for m in breakdown],
        recommendations=[LearningRoadmapItem(**r) for r in roadmap],
        created_at=now_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
    )


@app.get("/api/history", response_model=List[AnalysisHistoryItem])
def get_analysis_history(db: Session = Depends(get_db)):
    """Retrieves all historical skill gap assessment runs for candidate audit."""
    runs = db.query(AnalysisRun).order_by(AnalysisRun.created_at.desc()).all()
    results = []
    for r in runs:
        results.append(
            AnalysisHistoryItem(
                id=r.id,
                candidate_name=r.candidate_name,
                role_profile_title=r.role_profile_title,
                source_type=r.source_type,
                gap_index=r.gap_index,
                overall_match_score=r.overall_match_score,
                strong_matches_count=r.strong_matches_count,
                partial_matches_count=r.partial_matches_count,
                missing_skills_count=r.missing_skills_count,
                created_at=r.created_at.strftime("%Y-%m-%d %H:%M UTC") if r.created_at else "",
            )
        )
    return results


@app.get("/api/history/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_run_detail(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieves full explainability breakdown of a specific past run."""
    run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found")

    return AnalysisResponse(
        id=run.id,
        candidate_name=run.candidate_name,
        role_profile_title=run.role_profile_title,
        source_type=run.source_type,
        gap_index=run.gap_index,
        gap_index_percentage=round(run.gap_index * 100, 1),
        overall_match_score=run.overall_match_score,
        strong_matches_count=run.strong_matches_count,
        partial_matches_count=run.partial_matches_count,
        missing_skills_count=run.missing_skills_count,
        total_requirements_count=(
            run.strong_matches_count + run.partial_matches_count + run.missing_skills_count
        ),
        extracted_skills=[ExtractedSkillItem(**s) for s in (run.extracted_skills or [])],
        match_breakdown=[MatchBreakdownItem(**m) for m in (run.match_breakdown or [])],
        recommendations=[LearningRoadmapItem(**r) for r in (run.recommendations or [])],
        created_at=run.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if run.created_at else "",
    )


@app.delete("/api/history/{analysis_id}")
def delete_analysis_run(analysis_id: str, db: Session = Depends(get_db)):
    """Deletes an analysis run."""
    run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found")
    db.delete(run)
    db.commit()
    return {"message": f"Analysis run '{analysis_id}' deleted successfully"}
