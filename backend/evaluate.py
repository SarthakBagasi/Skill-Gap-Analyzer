"""
Standalone Evaluation Script: Hybrid Matcher vs. Exact Keyword Baseline.
Evaluates deterministic skill extraction and role matching accuracy across representative
benchmark candidate profiles with ground-truth skill sets.
"""

import time
from typing import List, Dict, Set, Tuple
from app.services.extractor import extract_skills_from_text, get_skills_catalog
from app.services.matcher import compute_skill_matches, get_catalog_map

# Curated benchmark evaluation profiles with known Ground-Truth skills
BENCHMARK_PROFILES = [
    {
        "id": "bench_01_backend_aliases",
        "name": "Backend Engineer with Aliases & Tools",
        "target_role_id": "backend_developer",
        "resume_text": """
        Backend Software Engineer with 3 years building scalable services.
        - Designed and implemented microservices using Python 3 and FastAPI framework.
        - Deployed relational databases using Postgres with optimized SQL schemas.
        - Containerized backend workloads with Docker and orchestrated with K8s.
        - Implemented in-memory caching layers with Redis cache to reduce query latency.
        - Established continuous integration pipelines using CI/CD and GitHub Actions.
        - Wrote comprehensive unit tests and automated regression suites with Pytest.
        """,
        "ground_truth_skills": {"python", "fastapi", "postgresql", "docker", "kubernetes", "redis", "ci_cd", "unit_testing", "sql", "git"}
    },
    {
        "id": "bench_02_semantic_variations",
        "name": "Data Scientist with Semantic & Conceptual Expressions",
        "target_role_id": "data_scientist",
        "resume_text": """
        Data Scientist focused on statistical inference and predictive analytics.
        - Extensive experience in numerical programming and statistical data wrangling using Pandas dataframes and matrix operations.
        - Trained classification and regression models using supervised learning algorithms in Scikit-Learn.
        - Formulated hypothesis testing, p-value calculations, and A/B test experiments.
        - Built automated analytical queries and table joins across enterprise relational warehouses.
        - Communicated statistical distributions and correlation trends using interactive plotting and Matplotlib charting.
        """,
        "ground_truth_skills": {"python", "pandas", "numpy", "scikit_learn", "statistics_probability", "sql", "data_visualization", "machine_learning"}
    },
    {
        "id": "bench_03_tech_symbols",
        "name": "Systems Developer with Symbol-Heavy Tech Tokens",
        "target_role_id": "backend_developer",
        "resume_text": """
        Senior Systems Engineer specializing in high-throughput network architectures.
        - Developed low-latency concurrent daemons in C++ and Modern C++.
        - Built enterprise web service gateways in ASP.NET Core and C# on .NET.
        - Designed RESTful API specifications with OpenAPI documentation.
        - Configured Linux systemd daemons and bash shell automation scripts.
        - Collaborated via Git version control across multi-team monorepos.
        """,
        "ground_truth_skills": {"cpp", "csharp", "dotnet_core", "rest_api", "linux", "bash_shell", "git", "system_design"}
    },
    {
        "id": "bench_04_ml_engineer",
        "name": "ML Engineer with Deep Learning Focus",
        "target_role_id": "ml_engineer",
        "resume_text": """
        Machine Learning Engineer with experience in deep learning and production deployment.
        - Built and trained neural networks and transformer models in PyTorch.
        - Conducted supervised learning, hyperparameter tuning, and gradient descent optimization.
        - Deployed REST inference endpoints with FastAPI inside Docker containers.
        - Implemented experiment tracking and model artifact registries using MLOps principles and MLflow.
        - Strong background in data structures and algorithms with Python programming.
        """,
        "ground_truth_skills": {"pytorch", "machine_learning", "deep_learning", "fastapi", "docker", "mlops", "python", "data_structures_algorithms"}
    }
]


def exact_keyword_baseline_extractor(text: str, catalog: Dict[str, Dict]) -> List[Dict]:
    """
    Baseline Method: Strictly checks for literal presence of canonical skill name
    as a naive case-insensitive substring without phrase matching, aliases, or embeddings.
    """
    text_lower = text.lower()
    matches = []
    for sid, skill in catalog.items():
        name_lower = skill["name"].lower()
        # Naive substring check
        if name_lower in text_lower:
            matches.append({
                "skill_id": sid,
                "name": skill["name"],
                "category": skill["category"],
                "extraction_source": "exact_keyword_baseline",
                "confidence": 1.0,
                "matched_text": skill["name"]
            })
    return matches


def calculate_metrics(predicted: Set[str], ground_truth: Set[str]) -> Tuple[float, float, float]:
    """Computes Precision, Recall, and F1-score."""
    if not predicted:
        return 0.0, 0.0, 0.0

    true_positives = len(predicted.intersection(ground_truth))
    precision = true_positives / len(predicted) if predicted else 0.0
    recall = true_positives / len(ground_truth) if ground_truth else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    return precision, recall, f1


def run_evaluation():
    print("=" * 80)
    print("  AI-BASED SKILL GAP ANALYZER: BENCHMARK EVALUATION")
    print("  Comparing: Hybrid Matcher (spaCy + Sentence-BERT) vs. Exact Keyword Baseline")
    print("=" * 80)
    print()

    catalog = get_catalog_map()

    total_baseline_p, total_baseline_r, total_baseline_f1 = 0.0, 0.0, 0.0
    total_hybrid_p, total_hybrid_r, total_hybrid_f1 = 0.0, 0.0, 0.0
    num_profiles = len(BENCHMARK_PROFILES)

    start_time = time.time()

    for idx, bench in enumerate(BENCHMARK_PROFILES, 1):
        gt = bench["ground_truth_skills"]
        text = bench["resume_text"]

        # Run Exact Keyword Baseline
        baseline_extracted = exact_keyword_baseline_extractor(text, catalog)
        baseline_pred_ids = {s["skill_id"] for s in baseline_extracted}
        b_p, b_r, b_f1 = calculate_metrics(baseline_pred_ids, gt)
        total_baseline_p += b_p
        total_baseline_r += b_r
        total_baseline_f1 += b_f1

        # Run Hybrid Matcher (spaCy PhraseMatcher + S-BERT + regex tech tokens)
        hybrid_extracted = extract_skills_from_text(text)
        hybrid_pred_ids = {s["skill_id"] for s in hybrid_extracted}
        h_p, h_r, h_f1 = calculate_metrics(hybrid_pred_ids, gt)
        total_hybrid_p += h_p
        total_hybrid_r += h_r
        total_hybrid_f1 += h_f1

        print(f"Profile {idx}: {bench['name']}")
        print(f"  Target Role: {bench['target_role_id']}")
        print(f"  Ground Truth Skills ({len(gt)}): {', '.join(sorted(gt))}")
        print(f"  [Exact Baseline] Extracted {len(baseline_pred_ids)}: Precision: {b_p:.3f} | Recall: {b_r:.3f} | F1: {b_f1:.3f}")
        print(f"  [Hybrid Matcher] Extracted {len(hybrid_pred_ids)}: Precision: {h_p:.3f} | Recall: {h_r:.3f} | F1: {h_f1:.3f}")

        # Show explainability gains: skills captured by Hybrid that Baseline missed
        captured_gain = hybrid_pred_ids - baseline_pred_ids
        if captured_gain:
            gain_names = [catalog.get(sid, {}).get("name", sid) for sid in captured_gain]
            print(f"  (+) Hybrid Advantage Captured: {', '.join(gain_names)}")
        print("-" * 80)

    elapsed = time.time() - start_time

    avg_b_p = total_baseline_p / num_profiles
    avg_b_r = total_baseline_r / num_profiles
    avg_b_f1 = total_baseline_f1 / num_profiles

    avg_h_p = total_hybrid_p / num_profiles
    avg_h_r = total_hybrid_r / num_profiles
    avg_h_f1 = total_hybrid_f1 / num_profiles

    print()
    print("=" * 80)
    print("  SUMMARY EVALUATION METRICS ACROSS BENCHMARK DATASET")
    print("=" * 80)
    print(f"{'Method':<25} | {'Precision':<12} | {'Recall':<12} | {'F1-Score':<12} | {'Delta F1'}")
    print("-" * 80)
    print(f"{'Exact Keyword Baseline':<25} | {avg_b_p:<12.3f} | {avg_b_r:<12.3f} | {avg_b_f1:<12.3f} | Baseline")
    print(f"{'Hybrid Matcher (Ours)':<25} | {avg_h_p:<12.3f} | {avg_h_r:<12.3f} | {avg_h_f1:<12.3f} | +{(avg_h_f1 - avg_b_f1):.3f} (+{((avg_h_f1 - avg_b_f1)/avg_b_f1 * 100):.1f}%)")
    print("=" * 80)
    print(f"Evaluation finished in {elapsed:.2f} seconds. No LLM or generative hallucination involved.")
    print("=" * 80)


if __name__ == "__main__":
    run_evaluation()
