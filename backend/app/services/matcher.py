import json
import os
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Prevent HuggingFace Hub network retry timeouts in offline/sandboxed environments
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

_model = None
_catalog_skills_by_id = {}


def get_embedding_model():
    global _model
    if _model is None:
        import torch
        torch.set_num_threads(1)
        from sentence_transformers import SentenceTransformer
        try:
            _model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
        except Exception:
            _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def get_catalog_map() -> Dict[str, Dict[str, Any]]:
    global _catalog_skills_by_id
    if not _catalog_skills_by_id:
        catalog_path = os.path.join(os.path.dirname(__file__), "..", "data", "skills_catalog.json")
        if os.path.exists(catalog_path):
            with open(catalog_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    _catalog_skills_by_id[item["id"]] = item
    return _catalog_skills_by_id


def compute_skill_matches(
    extracted_candidate_skills: List[Dict[str, Any]],
    role_requirements: List[Dict[str, Any]],
    resume_text: str = ""
) -> Tuple[List[Dict[str, Any]], float, Dict[str, int]]:
    """
    Evaluates candidate skills against target requirements using deterministic
    Exact Keyword Matching and Sentence-BERT Semantic Vector Matching.

    Returns:
        (breakdown_items, gap_index_G, counts_dict)
    """
    model = get_embedding_model()
    catalog = get_catalog_map()

    # Create lookup map for candidate extracted skills
    candidate_skill_ids = {s["skill_id"]: s for s in extracted_candidate_skills}
    candidate_skill_names = [s["name"] for s in extracted_candidate_skills]

    # Pre-compute candidate embeddings if candidate has skills
    candidate_embeddings = None
    if candidate_skill_names:
        candidate_embeddings = model.encode(candidate_skill_names, convert_to_numpy=True)

    breakdown = []
    total_weight = 0.0
    weighted_score = 0.0

    strong_count = 0
    partial_count = 0
    missing_count = 0

    for req in role_requirements:
        req_skill_id = req["skill_id"]
        req_weight = float(req.get("weight", 0.1))
        req_importance = req.get("importance", "Important")
        min_threshold = float(req.get("min_threshold", 0.65))
        req_desc = req.get("description", "")

        catalog_entry = catalog.get(req_skill_id, {})
        req_name = catalog_entry.get("name", req_skill_id.replace("_", " ").title())
        req_category = catalog_entry.get("category", "General")

        total_weight += req_weight

        # 1. Exact Match Check
        if req_skill_id in candidate_skill_ids:
            matched_candidate = candidate_skill_ids[req_skill_id]
            sim_score = 1.0
            status = "Strong Match"
            match_type = "Exact Keyword Match"
            explanation = f"Exact match verified: '{matched_candidate['matched_text']}' matches canonical requirement."
            evidence = matched_candidate.get("matched_text", req_name)

            strong_count += 1
            weighted_score += req_weight * 1.0

            breakdown.append({
                "skill_id": req_skill_id,
                "skill_name": req_name,
                "category": req_category,
                "weight": req_weight,
                "importance": req_importance,
                "status": status,
                "match_type": match_type,
                "similarity_score": sim_score,
                "matched_candidate_skill": req_name,
                "evidence_snippet": evidence,
                "explanation": explanation
            })
            continue

        # 2. Semantic Match Check via Sentence-BERT
        best_sim = 0.0
        best_candidate_name = None

        if candidate_embeddings is not None and len(candidate_skill_names) > 0:
            # Encode requirement query (combining name and description for semantic context)
            req_query = f"{req_name}: {req_desc}" if req_desc else req_name
            req_emb = model.encode([req_query], convert_to_numpy=True)

            sim_matrix = cosine_similarity(req_emb, candidate_embeddings)[0]
            max_idx = int(np.argmax(sim_matrix))
            best_sim = float(sim_matrix[max_idx])
            best_sim = max(0.0, min(1.0, best_sim))  # clamp to [0, 1]
            best_candidate_name = candidate_skill_names[max_idx]

        # Classify based on similarity score and role threshold
        if best_sim >= min_threshold:
            status = "Strong Match"
            match_type = "Semantic Vector Match"
            explanation = (
                f"Strong semantic equivalence ({best_sim:.2f} similarity) with candidate competency "
                f"'{best_candidate_name}'."
            )
            score_contribution = best_sim
            strong_count += 1
        elif best_sim >= 0.45:
            status = "Partial Match"
            match_type = "Semantic Vector Match"
            explanation = (
                f"Partial semantic overlap ({best_sim:.2f} similarity) with '{best_candidate_name}'. "
                f"Target role requires deeper canonical proficiency in {req_name}."
            )
            score_contribution = best_sim * 0.7  # discounted for partial coverage
            partial_count += 1
        else:
            status = "Missing Skill"
            match_type = "None"
            explanation = (
                f"No direct or closely related skill identified in candidate profile "
                f"(highest semantic proximity was {best_sim:.2f} with '{best_candidate_name or 'N/A'}')."
            )
            score_contribution = 0.0
            missing_count += 1

        weighted_score += req_weight * score_contribution

        breakdown.append({
            "skill_id": req_skill_id,
            "skill_name": req_name,
            "category": req_category,
            "weight": req_weight,
            "importance": req_importance,
            "status": status,
            "match_type": match_type,
            "similarity_score": round(best_sim, 3),
            "matched_candidate_skill": best_candidate_name if best_sim >= 0.40 else None,
            "evidence_snippet": f"Proximity to: {best_candidate_name}" if best_sim >= 0.40 else None,
            "explanation": explanation
        })

    # Normalize total weight if needed
    if total_weight > 0:
        normalized_weighted_score = weighted_score / total_weight
    else:
        normalized_weighted_score = 0.0

    # Role Skill-Gap Index G = 1 - normalized_weighted_score
    gap_index_G = max(0.0, min(1.0, 1.0 - normalized_weighted_score))

    counts = {
        "strong": strong_count,
        "partial": partial_count,
        "missing": missing_count,
        "total": len(role_requirements)
    }

    return breakdown, round(gap_index_G, 4), counts
