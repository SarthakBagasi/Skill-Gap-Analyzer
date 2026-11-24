# Contributing to AI-Based Skill Gap Analyzer

Thank you for your interest in contributing to the **AI-Based Skill Gap Analyzer**! This project is an explainable career decision-support prototype built to help students and early-career engineers bridge competency gaps deterministically.

---

## Code of Conduct & Core Principles

1. **Deterministic Decision-Support First:**
   - The core extraction and matching pipeline must remain explainable and deterministic.
   - Do not substitute the deterministic NLP/Sentence-BERT pipeline with non-deterministic or generative LLM API calls in the scoring loop.
2. **Preserve Ethical Decision-Support Framing:**
   - All contributions must frame the system as a **student career decision-support and learning guidance tool**.
   - It must never be refactored into an automated hiring gate, ATS rejection filter, or candidate ranking engine.
3. **Data Integrity:**
   - Never fabricate or mock benchmark metrics. Any accuracy or F1 claims must be empirically reproducible via `evaluate.py`.

---

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ (Node 20 LTS recommended)
- Git

### 1. Clone & Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Extending the Skill Catalog & Roles

### Adding New Canonical Skills
To introduce new technical skills, edit `backend/app/data/skills_catalog.json`:
- Assign a unique canonical `name`.
- Specify its primary `category` (e.g., `Languages`, `Frameworks`, `Cloud & DevOps`, `Data & ML`).
- Provide common aliases and synonyms (e.g., `["k8s", "kubernetes container orchestration"]`).
- Define any prerequisite skill names to ensure proper foundation-first roadmap ordering.

### Adding New Role Profiles
To add or modify target industry profiles, edit `backend/app/data/role_profiles.json`:
- Define role `title` and `description`.
- Assign weights $w_j \in [1, 5]$ to each required skill.
- Run `python evaluate.py` to ensure benchmark consistency.

---

## Testing & Quality Checks

Before submitting a Pull Request, verify all checks pass:

1. **Backend Evaluation Benchmark:**
   ```bash
   cd backend
   python evaluate.py
   ```
2. **Frontend Production Build:**
   ```bash
   cd frontend
   npm run build
   ```

---

## Submitting Pull Requests
- Provide a clear, descriptive PR title and summary.
- Reference any related issues or discussions.
- Ensure no sensitive files (`.env`, `*.db`, credentials) are included in commits.
