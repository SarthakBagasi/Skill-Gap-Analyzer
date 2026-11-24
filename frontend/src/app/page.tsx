"use client";

import React, { useState, useEffect } from "react";
import InputPanel from "@/components/InputPanel";
import GapSummaryCards from "@/components/GapSummaryCards";
import EvidenceTable from "@/components/EvidenceTable";
import LearningRoadmap from "@/components/LearningRoadmap";
import { RoleProfile, AnalysisResponse } from "@/types/analysis";
import {
  Sparkles,
  BookOpen,
  Info,
  CheckCircle,
  FileCheck,
  ChevronDown,
  Layers,
  Cpu,
  ShieldAlert,
  Printer,
  Copy,
  Check,
  ArrowRight,
  Calculator,
  Compass,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FALLBACK_ROLES: RoleProfile[] = [
  {
    id: "backend_developer",
    title: "Backend Developer",
    description: "Designs server-side APIs, database schemas, and microservice architectures.",
    requirements: [
      { skill_id: "python", weight: 0.18, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "fastapi", weight: 0.16, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "postgresql", weight: 0.15, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "docker", weight: 0.12, importance: "Important", min_threshold: 0.60 },
      { skill_id: "rest_api", weight: 0.12, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "redis", weight: 0.09, importance: "Important", min_threshold: 0.55 },
      { skill_id: "git", weight: 0.08, importance: "Important", min_threshold: 0.60 },
      { skill_id: "unit_testing", weight: 0.10, importance: "Important", min_threshold: 0.60 },
    ],
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    description: "Predictive insights using statistical modeling and machine learning.",
    requirements: [
      { skill_id: "python", weight: 0.18, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "pandas", weight: 0.16, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "numpy", weight: 0.12, importance: "Important", min_threshold: 0.60 },
      { skill_id: "scikit_learn", weight: 0.16, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "statistics_probability", weight: 0.14, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "sql", weight: 0.12, importance: "Important", min_threshold: 0.60 },
      { skill_id: "data_visualization", weight: 0.12, importance: "Important", min_threshold: 0.60 },
    ],
  },
  {
    id: "ml_engineer",
    title: "Machine Learning Engineer",
    description: "Deploys, optimizes, and monitors deep learning models in production.",
    requirements: [
      { skill_id: "python", weight: 0.15, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "pytorch", weight: 0.18, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "machine_learning", weight: 0.14, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "mlops", weight: 0.15, importance: "Must Have", min_threshold: 0.65 },
      { skill_id: "docker", weight: 0.12, importance: "Important", min_threshold: 0.60 },
      { skill_id: "fastapi", weight: 0.10, importance: "Important", min_threshold: 0.60 },
      { skill_id: "data_structures_algorithms", weight: 0.08, importance: "Important", min_threshold: 0.60 },
    ],
  },
];

export default function HomePage() {
  const [roles, setRoles] = useState<RoleProfile[]>(FALLBACK_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState("backend_developer");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMathModal, setShowMathModal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/roles`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load roles");
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRoles(data);
        }
      })
      .catch((err) => {
        console.warn("Using fallback roles:", err);
      });
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAnalyze = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Server responded with status code ${res.status}`
        );
      }

      const result: AnalysisResponse = await res.json();
      setAnalysis(result);
      triggerToast(`Analysis Complete: ${result.overall_match_score.toFixed(1)}% Alignment Score calculated!`);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("analysis-results");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred during analysis."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterClick = (status: string) => {
    const tableEl = document.getElementById("evidence-matrix");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Deterministic Career Decision-Support Engine
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          AI-Based Skill Gap Analyzer
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Intelligent career skill assessment and explainable recommendation system.
          Extract candidate technical skills from resumes (PDF/DOCX/Text) and compare them
          against target job profiles using <strong>spaCy + Sentence-BERT semantic similarity</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowMathModal(true)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-xs transition flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            Inspect Mathematical Formulations
          </button>
        </div>
      </section>

      {/* Input Panel Workspace */}
      <section>
        <InputPanel
          roles={roles}
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
          onSubmit={handleAnalyze}
          isLoading={isLoading}
        />
      </section>

      {/* Error Message Callout */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-sm text-rose-800 flex items-start gap-3.5 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-1">
              Analysis Execution Halted
            </strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <section id="analysis-results" className="space-y-10 pt-4">
          {/* Results Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                Audited Assessment Results
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {analysis.candidate_name} &bull; {analysis.role_profile_title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Extracted Skills Summary Chip Cloud */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  Extracted Candidate Competencies ({analysis.extracted_skills.length} Detected)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted via spaCy PhraseMatcher & noun-chunk fallback from submitted resume text
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto font-semibold">
                Source Document: {analysis.source_type.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {analysis.extracted_skills.map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-xs text-slate-800 shadow-2xs transition group"
                >
                  <span className="font-bold text-slate-900">{skill.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                    {skill.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Gap Summary Cards with Recharts & What-If Simulator */}
          <GapSummaryCards
            analysis={analysis}
            onFilterClick={handleFilterClick}
          />

          {/* 2. Requirement-Level Explainability Matrix */}
          <div id="evidence-matrix">
            <EvidenceTable items={analysis.match_breakdown} />
          </div>

          {/* 3. Prioritized Traceable Learning Roadmap */}
          <LearningRoadmap roadmap={analysis.recommendations} />
        </section>
      )}

      {/* Mathematical Formulations Explainer Modal */}
      {showMathModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Mathematical Framework & Formulas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministic career decision-support formulations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMathModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  1. Role Skill-Gap Index (G) Formulation
                </h4>
                <p className="font-mono text-indigo-700 font-bold bg-white p-2.5 rounded-xl border border-slate-200 mb-2">
                  G = 1.0 - ( Σ (w_j · s_j) / Σ w_j )
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Where w_j is the requirement weight and s_j is the match score. Exact keyword matches yield s_j = 1.0; semantic vector matches yield cosine similarity s_j ∈ [0.45, 1.0].
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  2. Priority Ranking & Prerequisite Tie-Breaking
                </h4>
                <p className="font-mono text-indigo-700 font-bold bg-white p-2.5 rounded-xl border border-slate-200 mb-2">
                  p_j = w_j · (1.0 - s_j) + foundation_bonus - readiness_penalty
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Missing skills that serve as prerequisites for other missing competencies receive a foundation bonus (+0.25) so students sequence core fundamentals before advanced frameworks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it Works / Academic Methodology Section */}
      <section
        id="how-it-works"
        className="glass-panel rounded-3xl p-8 sm:p-10 shadow-xs border-slate-200 space-y-8"
      >
        <div className="border-b border-slate-100 pb-5">
          <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
            Academic Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            How Deterministic Skill Gap Analysis Operates
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic NLP pipeline combining token-preserving ingestion, dictionary phrase matching, and Sentence-BERT vector representations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              High-Fidelity Document Ingestion
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resumes are parsed via PyMuPDF and python-docx. Technical symbols (C++, C#, .NET, CI/CD, Node.js) are explicitly protected from regex truncation.
            </p>
          </div>

          <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Hybrid spaCy + S-BERT Engine
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              spaCy PhraseMatcher evaluates 60+ canonical skills and aliases. Sentence-BERT all-MiniLM-L6-v2 evaluates semantic proximity without LLM hallucinations.
            </p>
          </div>

          <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Traceable Decision-Support
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Outputs an explainability matrix, Gap Index (G), and sequenced learning roadmap with official documentation links and portfolio deliverables.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
