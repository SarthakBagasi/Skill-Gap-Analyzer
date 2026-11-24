"""
Comprehensive Evaluation & Reporting Script for Chapter 5
Compares:
  1. Exact Keyword Baseline (naive substring search)
  2. Dictionary-Only Matcher (spaCy PhraseMatcher + aliases without semantic vector matching)
  3. Hybrid Sentence-BERT Matcher (spaCy + regex tech symbols + Sentence-BERT all-MiniLM-L6-v2)

Generates:
  - Numerical metrics table (Precision, Recall, Specificity, Accuracy, F1-Score)
  - Confusion Matrix (TP, FP, FN, TN)
  - 4 High-Resolution Publication-Quality .png Figures for Academic Report Chapter 5
"""

import os
import sys
import shutil
import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Set, Tuple

# Set HuggingFace offline
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from app.services.extractor import extract_skills_from_text, get_nlp_and_matcher
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


# ---------------------------------------------------------------------------
# Methods Under Evaluation
# ---------------------------------------------------------------------------

def exact_keyword_baseline(text: str, catalog: Dict[str, Dict]) -> Set[str]:
    """Method 1: Naive substring check on canonical skill name."""
    text_lower = text.lower()
    predicted = set()
    for sid, skill in catalog.items():
        if skill["name"].lower() in text_lower:
            predicted.add(sid)
    return predicted


def dictionary_only_matcher(text: str, catalog: Dict[str, Dict]) -> Set[str]:
    """Method 2: spaCy PhraseMatcher with aliases, without semantic vectors or symbol-regex."""
    nlp, matcher, skills_by_id, _ = get_nlp_and_matcher()
    doc = nlp(text)
    matches = matcher(doc)
    predicted = set()
    for match_id, start, end in matches:
        rule_id = nlp.vocab.strings[match_id]
        if rule_id in catalog:
            predicted.add(rule_id)
    return predicted


def hybrid_sentence_bert_matcher(text: str) -> Set[str]:
    """Method 3: Full hybrid extractor (spaCy PhraseMatcher + regex tokens + noun-chunks)."""
    extracted = extract_skills_from_text(text)
    return {s["skill_id"] for s in extracted}


def compute_binary_confusion_matrix(predicted: Set[str], ground_truth: Set[str], total_skills: int = 61):
    """Computes TP, FP, FN, TN over total skills universe."""
    tp = len(predicted.intersection(ground_truth))
    fp = len(predicted - ground_truth)
    fn = len(ground_truth - predicted)
    tn = total_skills - (tp + fp + fn)
    return tp, fp, fn, tn


def run_comprehensive_evaluation():
    catalog = get_catalog_map()
    total_skills = len(catalog) if catalog else 61

    methods = [
        ("Exact Keyword Baseline", exact_keyword_baseline),
        ("Dictionary-Only (spaCy)", dictionary_only_matcher),
        ("Hybrid Sentence-BERT (Ours)", hybrid_sentence_bert_matcher)
    ]

    results = {
        "Exact Keyword Baseline": {"tp": 0, "fp": 0, "fn": 0, "tn": 0, "per_profile_f1": []},
        "Dictionary-Only (spaCy)": {"tp": 0, "fp": 0, "fn": 0, "tn": 0, "per_profile_f1": []},
        "Hybrid Sentence-BERT (Ours)": {"tp": 0, "fp": 0, "fn": 0, "tn": 0, "per_profile_f1": []}
    }

    print("=" * 90)
    print("  CHAPTER 5 EVALUATION: BENCHMARK COMPARISON & CONFUSION MATRIX METRICS")
    print("=" * 90)

    for bench in BENCHMARK_PROFILES:
        gt = bench["ground_truth_skills"]
        text = bench["resume_text"]
        print(f"\nEvaluating Profile: {bench['name']} (GT Count: {len(gt)})")

        for m_name, m_func in methods:
            if m_name == "Hybrid Sentence-BERT (Ours)":
                pred = m_func(text)
            else:
                pred = m_func(text, catalog)

            tp, fp, fn, tn = compute_binary_confusion_matrix(pred, gt, total_skills)
            results[m_name]["tp"] += tp
            results[m_name]["fp"] += fp
            results[m_name]["fn"] += fn
            results[m_name]["tn"] += tn

            p = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            r = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * p * r) / (p + r) if (p + r) > 0 else 0.0
            results[m_name]["per_profile_f1"].append(round(f1, 4))

            print(f"  [{m_name:<28}] TP: {tp:2d} | FP: {fp:2d} | FN: {fn:2d} | TN: {tn:2d} | P: {p:.3f} | R: {r:.3f} | F1: {f1:.3f}")

    # Calculate overall macro and micro metrics
    summary_metrics = {}
    print("\n" + "=" * 90)
    print(f"{'Method':<28} | {'Precision':<9} | {'Recall':<9} | {'Specificity':<11} | {'Accuracy':<9} | {'F1-Score':<9}")
    print("-" * 90)

    for m_name in results:
        data = results[m_name]
        tp = data["tp"]
        fp = data["fp"]
        fn = data["fn"]
        tn = data["tn"]

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        summary_metrics[m_name] = {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "specificity": round(specificity, 4),
            "accuracy": round(accuracy, 4),
            "f1": round(f1, 4),
            "tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "per_profile_f1": data["per_profile_f1"]
        }

        print(f"{m_name:<28} | {precision:<9.3f} | {recall:<9.3f} | {specificity:<11.3f} | {accuracy:<9.3f} | {f1:<9.3f}")

    print("=" * 90)

    # ---------------------------------------------------------------------------
    # Generate Publication-Quality .png Figures
    # ---------------------------------------------------------------------------
    output_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "figures")
    os.makedirs(output_dir, exist_ok=True)

    # Setup matplotlib styling
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    plt.rcParams.update({
        "font.family": "sans-serif",
        "font.size": 11,
        "axes.titlesize": 13,
        "axes.titleweight": "bold",
        "axes.labelsize": 11,
        "figure.titlesize": 15,
        "figure.dpi": 300
    })

    # --- Figure 1: Grouped Bar Chart of Overall Metrics ---
    fig, ax = plt.subplots(figsize=(10, 6))
    metrics_names = ["Precision", "Recall", "Specificity", "Accuracy", "F1-Score"]
    x = np.arange(len(metrics_names))
    width = 0.25

    colors = ["#94a3b8", "#38bdf8", "#4f46e5"]  # slate-400, sky-400, indigo-600
    for idx, (m_name, color) in enumerate(zip(results.keys(), colors)):
        vals = [
            summary_metrics[m_name]["precision"],
            summary_metrics[m_name]["recall"],
            summary_metrics[m_name]["specificity"],
            summary_metrics[m_name]["accuracy"],
            summary_metrics[m_name]["f1"]
        ]
        rects = ax.bar(x + (idx - 1) * width, vals, width, label=m_name, color=color, edgecolor="#1e293b", linewidth=0.8)
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f"{height:.2f}",
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3), textcoords="offset points",
                        ha="center", va="bottom", fontsize=8, fontweight="bold")

    ax.set_ylabel("Score (0.0 to 1.0)")
    ax.set_title("Figure 5.1: Overall Performance Comparison Across Evaluated Methodologies", pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(metrics_names, fontweight="semibold")
    ax.set_ylim(0, 1.15)
    ax.legend(loc="upper right", frameon=True, facecolor="white", edgecolor="#cbd5e1")
    plt.tight_layout()
    fig1_path = os.path.join(output_dir, "fig1_evaluation_metrics_comparison.png")
    plt.savefig(fig1_path, dpi=300)
    plt.close()
    print(f"[Chart Generated] {fig1_path}")

    # --- Figure 2: Confusion Matrices Heatmap ---
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))
    for idx, (m_name, ax) in enumerate(zip(results.keys(), axes)):
        tp = summary_metrics[m_name]["tp"]
        fp = summary_metrics[m_name]["fp"]
        fn = summary_metrics[m_name]["fn"]
        tn = summary_metrics[m_name]["tn"]

        cm = np.array([[tp, fn], [fp, tn]])
        im = ax.imshow(cm, interpolation="nearest", cmap="Blues", vmin=0, vmax=240)

        # Labels
        ax.set_title(f"{m_name}\n(F1: {summary_metrics[m_name]['f1']:.3f})", fontsize=11, pad=10)
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Predicted Pos", "Predicted Neg"], fontweight="medium")
        ax.set_yticklabels(["Actual Pos", "Actual Neg"], fontweight="medium")

        # Annotate text
        text_colors = ["white" if cm[i, j] > 100 else "black" for i in range(2) for j in range(2)]
        labels = [
            f"TP = {tp}", f"FN = {fn}",
            f"FP = {fp}", f"TN = {tn}"
        ]
        coords = [(0, 0), (0, 1), (1, 0), (1, 1)]
        for (i, j), label in zip(coords, labels):
            val = cm[i, j]
            tc = "white" if val > 120 else "black"
            ax.text(j, i, f"{label}\n({val})", ha="center", va="center", color=tc, fontweight="bold", fontsize=10)

    fig.suptitle("Figure 5.2: Multi-Label Confusion Matrix Comparison (Aggregated over 4 Benchmark Profiles)", fontsize=13, fontweight="bold", y=1.05)
    plt.tight_layout()
    fig2_path = os.path.join(output_dir, "fig2_confusion_matrices.png")
    plt.savefig(fig2_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"[Chart Generated] {fig2_path}")

    # --- Figure 3: Per-Profile F1-Score Breakdown ---
    fig, ax = plt.subplots(figsize=(10, 5))
    profile_labels = [
        "P1: Backend Aliases\n(K8s, Postgres)",
        "P2: Data Science\n(Pandas, Stats)",
        "P3: Systems Developer\n(C++, C#, .NET)",
        "P4: ML Engineer\n(PyTorch, MLOps)"
    ]
    x_prof = np.arange(len(profile_labels))
    width = 0.25

    for idx, (m_name, color) in enumerate(zip(results.keys(), colors)):
        f1_vals = summary_metrics[m_name]["per_profile_f1"]
        rects = ax.bar(x_prof + (idx - 1) * width, f1_vals, width, label=m_name, color=color, edgecolor="#1e293b", linewidth=0.8)
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f"{height:.2f}",
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3), textcoords="offset points",
                        ha="center", va="bottom", fontsize=8, fontweight="bold")

    ax.set_ylabel("F1-Score")
    ax.set_title("Figure 5.3: F1-Score Robustness Across Diverse Candidate Skill Profiles", pad=15)
    ax.set_xticks(x_prof)
    ax.set_xticklabels(profile_labels, fontsize=10)
    ax.set_ylim(0, 1.15)
    ax.legend(loc="lower right", frameon=True, facecolor="white", edgecolor="#cbd5e1")
    plt.tight_layout()
    fig3_path = os.path.join(output_dir, "fig3_per_profile_f1_comparison.png")
    plt.savefig(fig3_path, dpi=300)
    plt.close()
    print(f"[Chart Generated] {fig3_path}")

    # --- Figure 4: Prerequisite Priority Curve Simulation ---
    fig, ax = plt.subplots(figsize=(9, 4.8))
    weights = np.linspace(0.1, 0.5, 100)
    
    # Base priority without prerequisites
    p_base_missing = weights * 1.0
    p_base_partial = weights * (1.0 - 0.65)
    # With foundation bonus (+0.25 for being prereq of 1 missing skill)
    p_boosted = p_base_missing + 0.25
    # With readiness penalty (-0.10 for 1 unmet prereq)
    p_penalized = p_base_missing - 0.10

    ax.plot(weights, p_boosted, label="Foundational Prerequisite Skill (+0.25 Bonus)", color="#059669", linewidth=2.4)
    ax.plot(weights, p_base_missing, label="Standard Missing Skill (Base Priority w_j)", color="#4f46e5", linewidth=2.2, linestyle="--")
    ax.plot(weights, p_penalized, label="Advanced Missing Skill with Unmet Prereq (-0.10 Penalty)", color="#d97706", linewidth=2.0, linestyle="-.")
    ax.plot(weights, p_base_partial, label="Partial Match Skill (Gap Magnitude 0.35)", color="#9333ea", linewidth=1.8, linestyle=":")

    ax.set_xlabel("Role Requirement Weight (w_j)")
    ax.set_ylabel("Computed Priority Score (p_j)")
    ax.set_title("Figure 5.4: Learning Roadmap Dynamic Prioritization & Prerequisite Curves", pad=12)
    ax.legend(loc="upper left", frameon=True, facecolor="white", edgecolor="#cbd5e1")
    plt.tight_layout()
    fig4_path = os.path.join(output_dir, "fig4_prerequisite_priority_curve.png")
    plt.savefig(fig4_path, dpi=300)
    plt.close()
    print(f"[Chart Generated] {fig4_path}")

    # Copy all figures to artifact directory if present
    artifact_dir = r"C:\Users\sarth\.gemini\antigravity\brain\d4c6f4be-1fdc-42da-bbea-7eff421f7d19"
    if os.path.exists(artifact_dir):
        for fig_name in ["fig1_evaluation_metrics_comparison.png", "fig2_confusion_matrices.png", "fig3_per_profile_f1_comparison.png", "fig4_prerequisite_priority_curve.png"]:
            src = os.path.join(output_dir, fig_name)
            dst = os.path.join(artifact_dir, fig_name)
            shutil.copy2(src, dst)
            print(f"[Copied to Artifact Dir] {dst}")

    return summary_metrics


if __name__ == "__main__":
    run_comprehensive_evaluation()
