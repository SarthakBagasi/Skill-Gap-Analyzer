import json
import os
from typing import List, Dict, Any, Set


_recommendations_cache = None
_catalog_cache = None


def load_recommendations_catalog() -> Dict[str, Dict[str, Any]]:
    global _recommendations_cache
    if _recommendations_cache is None:
        rec_path = os.path.join(os.path.dirname(__file__), "..", "data", "recommendations.json")
        _recommendations_cache = {}
        if os.path.exists(rec_path):
            with open(rec_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    _recommendations_cache[item["skill_id"]] = item
    return _recommendations_cache


def load_skills_catalog() -> Dict[str, Dict[str, Any]]:
    global _catalog_cache
    if _catalog_cache is None:
        cat_path = os.path.join(os.path.dirname(__file__), "..", "data", "skills_catalog.json")
        _catalog_cache = {}
        if os.path.exists(cat_path):
            with open(cat_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    _catalog_cache[item["id"]] = item
    return _catalog_cache


def generate_learning_roadmap(
    match_breakdown: List[Dict[str, Any]],
    candidate_skills: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Generates a prioritized, traceable learning roadmap for missing and partial skills.
    Applies Priority Formula p_j with prerequisite tie-breaking and foundation-first sequencing.
    """
    recs_map = load_recommendations_catalog()
    catalog = load_skills_catalog()

    candidate_skill_ids: Set[str] = {s["skill_id"] for s in candidate_skills}

    # Filter requirements that have a gap
    gap_items = [item for item in match_breakdown if item["status"] in ("Missing Skill", "Partial Match")]
    if not gap_items:
        return []

    gap_skill_ids: Set[str] = {item["skill_id"] for item in gap_items}

    # Analyze prerequisite dependency counts among missing skills
    # (How many other missing skills depend on this skill as a prerequisite?)
    dependent_count = {sid: 0 for sid in gap_skill_ids}
    for sid in gap_skill_ids:
        skill_entry = catalog.get(sid, {})
        prereqs = skill_entry.get("prerequisites", [])
        for p in prereqs:
            if p in dependent_count:
                dependent_count[p] += 1

    scored_roadmap = []

    for item in gap_items:
        sid = item["skill_id"]
        weight = float(item.get("weight", 0.1))
        sim = float(item.get("similarity_score", 0.0))
        gap_type = item["status"]

        # 1. Base Gap Magnitude: 1.0 for Missing, (1.0 - sim) for Partial
        gap_magnitude = 1.0 if gap_type == "Missing Skill" else max(0.2, 1.0 - sim)

        # 2. Base priority = weight * gap_magnitude
        base_priority = weight * gap_magnitude

        # 3. Prerequisite analysis
        skill_entry = catalog.get(sid, {})
        prerequisites = skill_entry.get("prerequisites", [])
        unmet_prereqs = [p for p in prerequisites if p not in candidate_skill_ids]

        # 4. Prerequisite tie-breaking & Foundation Boosting
        # - Foundational skill bonus: if other missing skills require this, boost it so it's tackled first!
        foundation_bonus = 0.25 * dependent_count.get(sid, 0)

        # - Readiness penalty: if skill has unmet prerequisites, slightly lower priority until prereqs are completed
        readiness_penalty = 0.10 * len(unmet_prereqs)

        priority_score = max(0.01, base_priority + foundation_bonus - readiness_penalty)

        # 5. Enrich with Curated Learning Data
        curated = recs_map.get(sid)
        if curated:
            title = curated["title"]
            objective = curated["objective"]
            topics = curated["topics"]
            docs = curated["official_docs"]
            tasks = curated["practice_tasks"]
            artifacts = curated["artifacts"]
            hours = curated.get("estimated_hours", 15)
            difficulty = curated.get("difficulty", "Intermediate")
        else:
            # Deterministic curated fallback for catalog items
            skill_name = item["skill_name"]
            title = f"Mastering {skill_name} Fundamentals & Application"
            objective = f"Develop hands-on proficiency in {skill_name} aligned with {item['category']} standards."
            topics = [f"{skill_name} Syntax & Core Patterns", "Best Practices & Idiomatic Architecture", "Integration & Testing"]
            docs = f"https://en.wikipedia.org/wiki/{skill_name.replace(' ', '_')}"
            tasks = [
                f"Complete a tutorial project demonstrating core operations in {skill_name}.",
                f"Build a miniature component or service utilizing {skill_name}.",
                f"Write automated verification tests validating functionality."
            ]
            artifacts = f"A functional demo repository showcasing {skill_name} best practices and unit tests."
            hours = 16
            difficulty = "Intermediate"

        scored_roadmap.append({
            "skill_id": sid,
            "skill_name": item["skill_name"],
            "category": item["category"],
            "priority_score": round(priority_score, 4),
            "gap_type": gap_type,
            "prerequisites": prerequisites,
            "unmet_prerequisites": unmet_prereqs,
            "title": title,
            "objective": objective,
            "topics": topics,
            "official_docs": docs,
            "practice_tasks": tasks,
            "artifacts": artifacts,
            "estimated_hours": hours,
            "difficulty": difficulty
        })

    # Sort descending by priority_score
    scored_roadmap.sort(key=lambda x: x["priority_score"], reverse=True)

    # Assign 1-based ranks
    for rank, rec in enumerate(scored_roadmap, start=1):
        rec["priority_rank"] = rank

    return scored_roadmap
