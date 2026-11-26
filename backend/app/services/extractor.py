import json
import os
import re
from typing import List, Dict, Any, Set
import spacy
from spacy.matcher import PhraseMatcher

# Cache the nlp model and matcher
_nlp = None
_matcher = None
_skills_by_id = {}
_phrase_to_skill_id = {}


def get_skills_catalog() -> List[Dict[str, Any]]:
    catalog_path = os.path.join(os.path.dirname(__file__), "..", "data", "skills_catalog.json")
    if os.path.exists(catalog_path):
        with open(catalog_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def get_nlp_and_matcher():
    global _nlp, _matcher, _skills_by_id, _phrase_to_skill_id
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm", disable=["ner"])
        except Exception:
            _nlp = spacy.blank("en")

        _matcher = PhraseMatcher(_nlp.vocab, attr="LOWER")
        catalog = get_skills_catalog()

        for skill in catalog:
            sid = skill["id"]
            _skills_by_id[sid] = skill

            # Add canonical name
            patterns = [skill["name"].lower()]
            _phrase_to_skill_id[skill["name"].lower()] = sid

            # Add aliases
            for alias in skill.get("aliases", []):
                alias_clean = alias.strip().lower()
                if alias_clean and alias_clean not in _phrase_to_skill_id:
                    patterns.append(alias_clean)
                    _phrase_to_skill_id[alias_clean] = sid

            docs = [_nlp.make_doc(text) for text in patterns if len(text.strip()) > 0]
            if docs:
                _matcher.add(sid, docs)

    return _nlp, _matcher, _skills_by_id, _phrase_to_skill_id


def extract_skills_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Hybrid skill extractor:
    1. spaCy PhraseMatcher across 60+ canonical skills and all aliases (exact / morphological token matching).
    2. Fallback regex for punctuation-sensitive tech symbols (C++, C#, .NET).
    3. Noun-chunk extractor for additional technical candidate phrases.
    """
    if not text or not text.strip():
        return []

    nlp, matcher, skills_by_id, phrase_map = get_nlp_and_matcher()
    doc = nlp(text)

    extracted: Dict[str, Dict[str, Any]] = {}

    # 1. Punctuation-sensitive regex check for symbols that NLP tokenizers may split
    special_symbols = [
        (r"(?i)\bc\+\+\b", "cpp", "C++"),
        (r"(?i)\bc#\b", "csharp", "C#"),
        (r"(?i)\.net\b", "dotnet_core", "ASP.NET Core"),
        (r"(?i)\bnode\.js\b", "nodejs", "Node.js"),
        (r"(?i)\bnext\.js\b", "nextjs", "Next.js"),
        (r"(?i)\bci/cd\b", "ci_cd", "CI/CD & GitHub Actions"),
        (r"(?i)\baws\b", "aws", "Amazon Web Services (AWS)"),
        (r"(?i)\bgcp\b", "gcp", "Google Cloud Platform (GCP)"),
        (r"(?i)\bk8s\b", "kubernetes", "Kubernetes (K8s)"),
        (r"(?i)\bpostgres\b", "postgresql", "PostgreSQL"),
        (r"(?i)\bmlops\b", "mlops", "MLOps & Model Deployment"),
        (r"(?i)\bopencv\b", "computer_vision", "Computer Vision"),
        (r"(?i)\bpytorch\b", "pytorch", "PyTorch"),
        (r"(?i)\btensorflow\b", "tensorflow", "TensorFlow & Keras"),
    ]

    for pattern, skill_id, default_name in special_symbols:
        match = re.search(pattern, text)
        if match:
            skill_info = skills_by_id.get(skill_id, {})
            extracted[skill_id] = {
                "skill_id": skill_id,
                "name": skill_info.get("name", default_name),
                "category": skill_info.get("category", "Technical"),
                "extraction_source": "canonical_phrase_matcher",
                "confidence": 1.0,
                "matched_text": match.group(0),
            }

    # 2. PhraseMatcher pass
    matches = matcher(doc)
    for match_id, start, end in matches:
        rule_id = nlp.vocab.strings[match_id]
        span = doc[start:end]
        matched_text = span.text.strip()
        skill_info = skills_by_id.get(rule_id, {})

        if rule_id not in extracted:
            extracted[rule_id] = {
                "skill_id": rule_id,
                "name": skill_info.get("name", rule_id.replace("_", " ").title()),
                "category": skill_info.get("category", "General"),
                "extraction_source": "canonical_phrase_matcher",
                "confidence": 1.0,
                "matched_text": matched_text,
            }

    # 3. Noun-chunk fallback pass for technical candidates
    stop_words = {"experience", "knowledge", "skill", "skills", "ability", "proficient", "strong", "team", "project", "work", "years", "candidate", "responsibilities", "system", "tools", "environment"}
    for chunk in doc.noun_chunks:
        chunk_clean = chunk.text.strip().lower()
        # Clean leading articles/determiners
        chunk_clean = re.sub(r"^(a|an|the|my|our)\s+", "", chunk_clean)
        if len(chunk_clean) < 3 or chunk_clean in stop_words:
            continue

        # Check if chunk_clean maps directly to an alias or canonical skill
        if chunk_clean in phrase_map:
            target_id = phrase_map[chunk_clean]
            if target_id not in extracted:
                skill_info = skills_by_id.get(target_id, {})
                extracted[target_id] = {
                    "skill_id": target_id,
                    "name": skill_info.get("name", chunk.text.strip()),
                    "category": skill_info.get("category", "Technical"),
                    "extraction_source": "noun_chunk_fallback",
                    "confidence": 0.90,
                    "matched_text": chunk.text.strip(),
                }

    return list(extracted.values())
