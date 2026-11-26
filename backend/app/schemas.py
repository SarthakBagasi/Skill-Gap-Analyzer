from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    id: str
    name: str
    category: str
    aliases: List[str] = []
    prerequisites: List[str] = []
    description: Optional[str] = None


class SkillResponse(SkillBase):
    class Config:
        from_attributes = True


class RoleRequirement(BaseModel):
    skill_id: str
    weight: float = 0.1
    importance: str = "Important"  # Must Have, Important, Nice to Have
    min_threshold: float = 0.6
    description: Optional[str] = None


class RoleProfileResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    requirements: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class MatchBreakdownItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    weight: float
    importance: str
    status: str  # "Strong Match", "Partial Match", "Missing Skill"
    match_type: str  # "Exact Keyword Match", "Semantic Vector Match", "None"
    similarity_score: float  # 0.0 to 1.0
    matched_candidate_skill: Optional[str] = None
    evidence_snippet: Optional[str] = None
    explanation: str


class LearningRoadmapItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    priority_score: float
    priority_rank: int
    gap_type: str  # "Missing Skill", "Partial Match"
    prerequisites: List[str] = []
    unmet_prerequisites: List[str] = []
    title: str
    objective: str
    topics: List[str] = []
    official_docs: str
    practice_tasks: List[str] = []
    artifacts: str
    estimated_hours: int = 15
    difficulty: str = "Intermediate"


class ExtractedSkillItem(BaseModel):
    skill_id: str
    name: str
    category: str
    extraction_source: str  # "canonical_phrase_matcher", "noun_chunk_fallback"
    confidence: float
    matched_text: str


class AnalysisRequest(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    resume_text: Optional[str] = None
    role_profile_id: Optional[str] = "backend_developer"
    custom_job_description: Optional[str] = None


class AnalysisResponse(BaseModel):
    id: str
    candidate_name: str
    role_profile_title: str
    source_type: str  # text, pdf, docx
    gap_index: float  # G index, 0.0 to 1.0
    gap_index_percentage: float  # e.g. 35.0%
    overall_match_score: float  # (1 - G) * 100
    strong_matches_count: int
    partial_matches_count: int
    missing_skills_count: int
    total_requirements_count: int
    extracted_skills: List[ExtractedSkillItem]
    match_breakdown: List[MatchBreakdownItem]
    recommendations: List[LearningRoadmapItem]
    disclaimer: str = (
        "AI-Based Skill Gap Analyzer is an explainable career decision-support tool "
        "designed strictly for student learning path guidance, NOT an automated hiring filter, "
        "ATS screening score, or formal certification engine."
    )
    created_at: str


class AnalysisHistoryItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    candidate_name: str
    role_profile_title: str
    source_type: str
    gap_index: float
    overall_match_score: float
    strong_matches_count: int
    partial_matches_count: int
    missing_skills_count: int
    created_at: str

    class Config:
        from_attributes = True


class UserRegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    target_role_id: Optional[str] = None


class UserLoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    full_name: str
    email: Optional[str] = None
    role: str = "candidate"
    target_role_id: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    message: str
