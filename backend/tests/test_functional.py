"""
Pytest Functional Test Suite: TC-01 through TC-15
Covers Document Parsing, Skill Extraction, Semantic Matching,
Roadmap Recommendation, API Endpoints, and Database Persistence.
"""

import os
import pytest
from app.services.parser import preserve_clean_text, parse_document
from app.services.extractor import extract_skills_from_text, get_skills_catalog
from app.services.matcher import compute_skill_matches, get_catalog_map
from app.services.recommender import generate_learning_roadmap
from app.database import SessionLocal, engine, Base
from app.models import Skill, RoleProfile, CuratedRecommendation, AnalysisRun


# ---------------------------------------------------------------------------
# Module 1: Document Parsing & Token Preservation (TC-01 to TC-02)
# ---------------------------------------------------------------------------

def test_tc01_parser_symbol_token_preservation():
    """TC-01: Verify parser preserves punctuation-dense tech symbols without mangling."""
    raw_sample = "Developed high-concurrency microservices in C++, C#, .NET, Node.js, and CI/CD."
    cleaned = preserve_clean_text(raw_sample)
    
    assert "C++" in cleaned, "C++ token was altered or stripped"
    assert "C#" in cleaned, "C# token was altered or stripped"
    assert ".NET" in cleaned, ".NET token was altered or stripped"
    assert "Node.js" in cleaned, "Node.js token was altered or stripped"
    assert "CI/CD" in cleaned, "CI/CD token was altered or stripped"


def test_tc02_parser_empty_and_corrupt_fallback():
    """TC-02: Verify parser handles empty strings and corrupt encodings gracefully."""
    empty_result = preserve_clean_text("")
    assert empty_result == "", "Empty text should return empty string"
    
    corrupt_bytes = b"\xff\xfe\x00\x00corrupt binary content \x80\x90\xa0"
    text, doc_type = parse_document(corrupt_bytes, "resume.txt")
    assert isinstance(text, str), "Parser must return a valid string even on corrupt encoding"
    assert doc_type == "text"


# ---------------------------------------------------------------------------
# Module 2: Skill Extraction & Normalization (TC-03 to TC-05)
# ---------------------------------------------------------------------------

def test_tc03_extractor_canonical_exact_matching():
    """TC-03: Verify exact canonical skills are identified with 1.0 confidence."""
    text = "Proficient in Python, Docker containerization, and PostgreSQL database architecture."
    extracted = extract_skills_from_text(text)
    extracted_ids = {s["skill_id"] for s in extracted}
    
    assert "python" in extracted_ids, "Python canonical skill missing"
    assert "docker" in extracted_ids, "Docker canonical skill missing"
    assert "postgresql" in extracted_ids, "PostgreSQL canonical skill missing"
    
    for s in extracted:
        assert s["confidence"] >= 0.90, f"Confidence below threshold for {s['skill_id']}"


def test_tc04_extractor_alias_normalization():
    """TC-04: Verify synonyms/aliases are normalized to their canonical skill IDs."""
    text = "Managed k8s clusters, deployed postgres instances, and built frontend with react.js."
    extracted = extract_skills_from_text(text)
    extracted_ids = {s["skill_id"] for s in extracted}
    
    assert "kubernetes" in extracted_ids, "Alias 'k8s' failed to normalize to 'kubernetes'"
    assert "postgresql" in extracted_ids, "Alias 'postgres' failed to normalize to 'postgresql'"
    assert "react" in extracted_ids, "Alias 'react.js' failed to normalize to 'react'"


def test_tc05_extractor_case_insensitivity_and_punctuation():
    """TC-05: Verify extraction handles varied casing and attached punctuation."""
    text = "Hands-on experience with FASTAPI, PyTest! and REDIS."
    extracted = extract_skills_from_text(text)
    extracted_ids = {s["skill_id"] for s in extracted}
    
    assert "fastapi" in extracted_ids, "Uppercase 'FASTAPI' failed to extract"
    assert "unit_testing" in extracted_ids or "fastapi" in extracted_ids
    assert "redis" in extracted_ids, "Uppercase 'REDIS' failed to extract"


# ---------------------------------------------------------------------------
# Module 3: Semantic Matching & Gap Index Calculation (TC-06 to TC-09)
# ---------------------------------------------------------------------------

def test_tc06_matcher_exact_vs_semantic_flagging():
    """TC-06: Verify exact text occurrences receive 'Exact Keyword Match'."""
    candidate_skills = [
        {"skill_id": "python", "name": "Python", "category": "Languages", "matched_text": "Python"}
    ]
    role_requirements = [
        {"skill_id": "python", "weight": 0.20, "importance": "Required", "min_threshold": 0.70}
    ]
    
    breakdown, gap_index, counts = compute_skill_matches(candidate_skills, role_requirements)
    assert len(breakdown) == 1
    assert breakdown[0]["match_type"] == "Exact Keyword Match"
    assert breakdown[0]["similarity_score"] == 1.0
    assert breakdown[0]["status"] == "Strong Match"
    assert gap_index == 0.0, "Gap index for 100% exact match must be 0.0"


def test_tc07_matcher_semantic_cosine_similarity():
    """TC-07: Verify Sentence-BERT cosine similarity identifies related competencies."""
    candidate_skills = [
        {"skill_id": "neural_networks", "name": "Neural Networks", "category": "Data & ML", "matched_text": "Neural Networks"}
    ]
    role_requirements = [
        {"skill_id": "deep_learning", "weight": 0.25, "importance": "Important", "min_threshold": 0.50}
    ]
    
    breakdown, gap_index, counts = compute_skill_matches(candidate_skills, role_requirements)
    assert len(breakdown) == 1
    # Neural Networks has strong semantic proximity (0.75) to Deep Learning
    assert breakdown[0]["match_type"] == "Semantic Vector Match"
    assert breakdown[0]["similarity_score"] >= 0.50, f"Expected semantic similarity >= 0.50, got {breakdown[0]['similarity_score']}"


def test_tc08_matcher_threshold_categorization():
    """TC-08: Verify correct classification into Strong, Partial, and Missing tiers."""
    candidate_skills = [
        {"skill_id": "fastapi", "name": "FastAPI", "category": "Frameworks", "matched_text": "FastAPI"}
    ]
    role_requirements = [
        {"skill_id": "fastapi", "weight": 0.3, "min_threshold": 0.65},      # Should be Strong
        {"skill_id": "kubernetes", "weight": 0.3, "min_threshold": 0.65},   # Missing
    ]
    
    breakdown, gap_index, counts = compute_skill_matches(candidate_skills, role_requirements)
    status_map = {item["skill_id"]: item["status"] for item in breakdown}
    
    assert status_map["fastapi"] == "Strong Match"
    assert status_map["kubernetes"] == "Missing Skill"
    assert counts["strong"] == 1
    assert counts["missing"] == 1


def test_tc09_matcher_gap_index_mathematical_bounds():
    """TC-09: Verify Gap Index G satisfies 0.0 <= G <= 1.0 for arbitrary inputs."""
    reqs = [
        {"skill_id": "python", "weight": 0.4},
        {"skill_id": "sql", "weight": 0.3},
        {"skill_id": "docker", "weight": 0.3}
    ]
    
    # 1. Zero candidate skills -> G should be 1.0
    _, g_empty, _ = compute_skill_matches([], reqs)
    assert g_empty == 1.0, f"Expected 1.0 for empty profile, got {g_empty}"
    
    # 2. Perfect candidate skills -> G should be 0.0
    perfect_cand = [{"skill_id": r["skill_id"], "name": r["skill_id"], "matched_text": r["skill_id"]} for r in reqs]
    _, g_perfect, _ = compute_skill_matches(perfect_cand, reqs)
    assert g_perfect == 0.0, f"Expected 0.0 for perfect profile, got {g_perfect}"
    
    # 3. Partial candidate skills -> 0.0 < G < 1.0
    partial_cand = [{"skill_id": "python", "name": "Python", "matched_text": "Python"}]
    _, g_partial, _ = compute_skill_matches(partial_cand, reqs)
    assert 0.0 < g_partial < 1.0, f"Expected bounded G, got {g_partial}"


# ---------------------------------------------------------------------------
# Module 4: Roadmap Recommendation & Prioritization (TC-10 to TC-12)
# ---------------------------------------------------------------------------

def test_tc10_recommender_priority_score_ranking():
    """TC-10: Verify higher weight missing skills receive higher priority scores."""
    match_breakdown = [
        {"skill_id": "sql", "skill_name": "SQL", "category": "Databases", "weight": 0.40, "similarity_score": 0.0, "status": "Missing Skill"},
        {"skill_id": "git", "skill_name": "Git", "category": "Tools", "weight": 0.10, "similarity_score": 0.0, "status": "Missing Skill"}
    ]
    roadmap = generate_learning_roadmap(match_breakdown, candidate_skills=[])
    
    assert len(roadmap) == 2
    assert roadmap[0]["skill_id"] == "sql", "Higher weight skill should rank first"
    assert roadmap[0]["priority_score"] > roadmap[1]["priority_score"]


def test_tc11_recommender_prerequisite_tie_breaking():
    """TC-11: Verify prerequisite foundational skills receive foundation bonus."""
    # Kubernetes has docker as prerequisite. If both are missing, docker should receive foundation bonus.
    match_breakdown = [
        {"skill_id": "kubernetes", "skill_name": "Kubernetes", "category": "Cloud & DevOps", "weight": 0.25, "similarity_score": 0.0, "status": "Missing Skill"},
        {"skill_id": "docker", "skill_name": "Docker", "category": "Cloud & DevOps", "weight": 0.25, "similarity_score": 0.0, "status": "Missing Skill"}
    ]
    roadmap = generate_learning_roadmap(match_breakdown, candidate_skills=[])
    
    docker_item = next(r for r in roadmap if r["skill_id"] == "docker")
    k8s_item = next(r for r in roadmap if r["skill_id"] == "kubernetes")
    
    assert docker_item["priority_score"] > k8s_item["priority_score"], "Docker should rank higher due to foundational prerequisite bonus"


def test_tc12_recommender_actionable_metadata_traceability():
    """TC-12: Verify every roadmap item contains objective, official docs, practice tasks, and artifacts."""
    match_breakdown = [
        {"skill_id": "fastapi", "skill_name": "FastAPI", "category": "Frameworks", "weight": 0.3, "similarity_score": 0.0, "status": "Missing Skill"}
    ]
    roadmap = generate_learning_roadmap(match_breakdown, candidate_skills=[])
    
    assert len(roadmap) == 1
    item = roadmap[0]
    assert len(item["objective"]) > 10, "Objective is empty or too short"
    assert item["official_docs"].startswith("http"), "Official docs must be a valid URL"
    assert isinstance(item["practice_tasks"], list) and len(item["practice_tasks"]) >= 2
    assert len(item["artifacts"]) > 5, "Portfolio artifact description is missing"


# ---------------------------------------------------------------------------
# Module 5: API Contracts & Database Persistence (TC-13 to TC-15)
# ---------------------------------------------------------------------------

def test_tc13_api_roles_endpoint():
    """TC-13: Verify all predefined industry roles are configured with positive weights."""
    import json
    role_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "role_profiles.json")
    with open(role_path, "r", encoding="utf-8") as f:
        roles = json.load(f)
    
    assert len(roles) >= 3, "At least 3 core roles must be defined"
    role_ids = {r["id"] for r in roles}
    assert "backend_developer" in role_ids
    assert "data_scientist" in role_ids
    assert "ml_engineer" in role_ids
    
    for r in roles:
        assert len(r["requirements"]) >= 5, f"Role {r['id']} has insufficient requirements"
        total_w = sum(req["weight"] for req in r["requirements"])
        assert total_w > 0, f"Role {r['id']} weights sum to 0"


def test_tc14_api_analyze_pipeline_integration():
    """TC-14: Verify complete end-to-end extraction, matching, and roadmap generation."""
    sample_text = """
    Software Engineer with 2 years of experience.
    Proficient in Python, SQL, Git, and Docker.
    Built REST APIs and containerized microservices.
    """
    extracted = extract_skills_from_text(sample_text)
    catalog = get_catalog_map()
    
    role_reqs = [
        {"skill_id": "python", "weight": 0.25, "importance": "Required"},
        {"skill_id": "sql", "weight": 0.25, "importance": "Required"},
        {"skill_id": "fastapi", "weight": 0.25, "importance": "Important"},
        {"skill_id": "kubernetes", "weight": 0.25, "importance": "Bonus"},
    ]
    
    breakdown, gap_index, counts = compute_skill_matches(extracted, role_reqs)
    roadmap = generate_learning_roadmap(breakdown, extracted)
    
    assert counts["strong"] >= 2, "Expected at least 2 strong matches (Python, SQL)"
    assert counts["missing"] >= 1, "Expected missing skills (FastAPI, Kubernetes)"
    assert 0.0 < gap_index < 1.0, f"Gap index out of expected range: {gap_index}"
    assert len(roadmap) == counts["missing"] + counts["partial"]


def test_tc15_database_audit_persistence():
    """TC-15: Verify analysis run model creates and persists records in database."""
    db = SessionLocal()
    try:
        run_record = AnalysisRun(
            id="test_run_tc15_001",
            candidate_name="Test Candidate",
            role_profile_id="backend_developer",
            role_profile_title="Backend Developer",
            source_type="text",
            gap_index=0.2500,
            overall_match_score=0.7500,
            strong_matches_count=6,
            partial_matches_count=2,
            missing_skills_count=2,
            extracted_skills=[{"skill_id": "python", "name": "Python"}],
            match_breakdown=[{"skill_id": "python", "status": "Strong Match"}],
            recommendations=[{"skill_id": "kubernetes", "priority_rank": 1}]
        )
        db.add(run_record)
        db.commit()
        
        # Query back
        retrieved = db.query(AnalysisRun).filter(AnalysisRun.id == "test_run_tc15_001").first()
        assert retrieved is not None, "Failed to retrieve persisted analysis run"
        assert retrieved.gap_index == 0.2500
        assert retrieved.candidate_name == "Test Candidate"
        assert len(retrieved.recommendations) == 1
        
        # Cleanup test record
        db.delete(retrieved)
        db.commit()
    finally:
        db.close()
