"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InputPanel from "@/components/InputPanel";
import GapSummaryCards from "@/components/GapSummaryCards";
import EvidenceTable from "@/components/EvidenceTable";
import LearningRoadmap from "@/components/LearningRoadmap";
import CommandPalette, { CommandItem } from "@/components/CommandPalette";
import { RoleProfile, AnalysisResponse } from "@/types/analysis";
import {
  Sparkles,
  FileCheck,
  Printer,
  Calculator,
  ShieldAlert,
  X,
  Keyboard,
  Compass,
  TrendingUp,
  FileCheck2,
  ArrowUp,
  User,
  ShieldCheck,
  Zap,
  Sliders,
  Cpu,
  Layers,
  BookOpen,
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

function AnalyzerContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role");

  const [roles, setRoles] = useState<RoleProfile[]>(FALLBACK_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialRoleParam || "backend_developer"
  );
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMathModal, setShowMathModal] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [tableSearchQuery, setTableSearchQuery] = useState("");

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

  useEffect(() => {
    if (initialRoleParam) {
      setSelectedRoleId(initialRoleParam);
    }
  }, [initialRoleParam]);

  // Keyboard accessibility for modal and global Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        if (showMathModal) setShowMathModal(false);
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMathModal, isCommandPaletteOpen]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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
        let errDetail = `HTTP ${res.status} error occurred`;
        try {
          const errData = await res.json();
          errDetail = errData.detail || errDetail;
        } catch (_) {}
        throw new Error(errDetail);
      }

      const data: AnalysisResponse = await res.json();
      setAnalysis(data);
      triggerToast(`Analysis complete: ${data.extracted_skills.length} skills extracted.`);

      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to execute skill gap analysis. Please verify your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterClick = (status: string) => {
    const tableEl = document.getElementById("evidence-matrix");
    tableEl?.scrollIntoView({ behavior: "smooth" });
  };

  const handleExtractedSkillClick = (skillName: string) => {
    setTableSearchQuery(skillName);
    triggerToast(`Filtered Evidence Matrix for competency: ${skillName}`);
    setTimeout(() => {
      document.getElementById("evidence-matrix")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCategoryClick = (category: string) => {
    setTableSearchQuery(category);
    triggerToast(`Filtered Evidence Matrix for category: ${category}`);
    setTimeout(() => {
      document.getElementById("evidence-matrix")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Command Palette Items
  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "persona-alex",
        title: "Alex Johnson (Backend Developer)",
        category: "Personas",
        description: "FastAPI, PostgreSQL, Redis, Docker, Pytest",
        icon: User,
        action: () => {
          setSelectedRoleId("backend_developer");
          triggerToast("Selected persona: Alex Johnson");
          document.getElementById("candidate-name-input")?.scrollIntoView({ behavior: "smooth" });
        },
        shortcut: "1",
      },
      {
        id: "persona-priya",
        title: "Priya Sharma (Data Scientist)",
        category: "Personas",
        description: "Pandas, NumPy, Scikit-Learn, Statistics, SQL",
        icon: User,
        action: () => {
          setSelectedRoleId("data_scientist");
          triggerToast("Selected persona: Priya Sharma");
          document.getElementById("candidate-name-input")?.scrollIntoView({ behavior: "smooth" });
        },
        shortcut: "2",
      },
      {
        id: "persona-marcus",
        title: "Marcus Vance (Machine Learning Engineer)",
        category: "Personas",
        description: "PyTorch, Deep Learning, MLOps, Docker, FastAPI",
        icon: User,
        action: () => {
          setSelectedRoleId("ml_engineer");
          triggerToast("Selected persona: Marcus Vance");
          document.getElementById("candidate-name-input")?.scrollIntoView({ behavior: "smooth" });
        },
        shortcut: "3",
      },
      {
        id: "jump-summary",
        title: "Jump to Skill-Gap Summary Cards",
        category: "Navigation",
        description: "View Gap Index (G), overall match score, and gauge",
        icon: TrendingUp,
        action: () => {
          document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth" });
        },
      },
      {
        id: "jump-matrix",
        title: "Jump to Explainability Matrix",
        category: "Navigation",
        description: "View requirement breakdown, cosine similarity & rationales",
        icon: FileCheck2,
        action: () => {
          document.getElementById("evidence-matrix")?.scrollIntoView({ behavior: "smooth" });
        },
      },
      {
        id: "jump-roadmap",
        title: "Jump to Prioritized Learning Roadmap",
        category: "Navigation",
        description: "Inspect sequenced curriculum, tasks, and documentation",
        icon: Compass,
        action: () => {
          document.getElementById("roadmap-items-container")?.scrollIntoView({ behavior: "smooth" });
        },
      },
      {
        id: "math-modal",
        title: "Inspect Mathematical Formulas",
        category: "Export & Actions",
        description: "View deterministic Gap Index (G) and ranking equations",
        icon: Calculator,
        action: () => setShowMathModal(true),
        shortcut: "M",
      },
      {
        id: "print-pdf",
        title: "Print / Save Assessment as PDF",
        category: "Export & Actions",
        description: "Export clean executive decision-support audit document",
        icon: Printer,
        action: () => window.print(),
        shortcut: "⌘P",
      },
    ],
    []
  );

  return (
    <div className="space-y-12">
      {/* Accessible Live Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workspace Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Production Analyzer Workspace</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
          Candidate Resume Audit &amp; Gap Assessment
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:pretty]">
          Ingest resumes (PDF, DOCX, or text) and benchmark skills against target industry roles using 
          <strong> spaCy PhraseMatcher</strong> and <strong>Sentence-BERT semantic vectors</strong>. Zero hallucination.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Open keyboard command palette"
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-2"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Command Palette</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-700">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={() => setShowMathModal(true)}
            aria-haspopup="dialog"
            aria-expanded={showMathModal}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>Mathematical Formulations (G)</span>
          </button>
        </div>
      </section>

      {/* Input Panel Workspace */}
      <section id="workspace" aria-label="Resume Ingestion and Target Role Workspace">
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
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-sm text-rose-800 flex items-start gap-3.5 shadow-xs"
        >
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
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
        <section id="analysis-results" className="space-y-10 pt-4" aria-label="Skill Gap Assessment Results">
          {/* Results Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {analysis.candidate_name} &bull; {analysis.role_profile_title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against {analysis.total_requirements_count} core competencies
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors items-center gap-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <Keyboard className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Quick Actions
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Print or save assessment summary as PDF"
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Extracted Skills Summary Chip Cloud (Interactive filter tags) */}
          <div className="craft-card rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  Extracted Candidate Competencies ({analysis.extracted_skills.length} Detected)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any skill chip below to highlight and filter its corresponding audit evaluation in the matrix
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto font-semibold">
                Format: {analysis.source_type.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1" aria-label="Extracted skills list">
              {analysis.extracted_skills.map((skill, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleExtractedSkillClick(skill.name)}
                  aria-label={`Highlight and filter ${skill.name} in Evidence Matrix`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs text-slate-800 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 shadow-2xs group"
                >
                  <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{skill.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {skill.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Gap Summary Cards with Recharts & What-If Simulator */}
          <GapSummaryCards
            analysis={analysis}
            onFilterClick={handleFilterClick}
            onCategoryClick={handleCategoryClick}
          />

          {/* 2. Requirement-Level Explainability Matrix */}
          <div id="evidence-matrix">
            <EvidenceTable
              items={analysis.match_breakdown}
              searchQueryProp={tableSearchQuery}
            />
          </div>

          {/* 3. Prioritized Traceable Learning Roadmap */}
          <LearningRoadmap roadmap={analysis.recommendations} />
        </section>
      )}

      {/* Mathematical Formulations Explainer Modal */}
      {showMathModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="math-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="math-modal-title" className="text-lg font-bold text-slate-900">
                    Mathematical Framework &amp; Formulas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministic career decision-support formulations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMathModal(false)}
                aria-label="Close mathematical framework dialog"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  1. Role Skill-Gap Index (G) Formulation
                </h4>
                <p className="font-mono text-indigo-700 font-bold bg-white p-2.5 rounded-lg border border-slate-200 mb-2">
                  G = 1.0 - ( &Sigma; (w_j &middot; s_j) / &Sigma; w_j )
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Where w_j is the requirement weight and s_j is the candidate match score. Exact keyword matches yield s_j = 1.0; semantic vector matches compute cosine similarity s_j &isin; [0.45, 1.0].
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  2. Priority Ranking &amp; Prerequisite Tie-Breaking
                </h4>
                <p className="font-mono text-indigo-700 font-bold bg-white p-2.5 rounded-lg border border-slate-200 mb-2">
                  p_j = w_j &middot; (1.0 - s_j) + foundation_bonus - readiness_penalty
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Missing skills that serve as prerequisites for other missing competencies receive a foundation bonus (+0.25) so students sequence core fundamentals before advanced frameworks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive Navigation Dock when analysis is active */}
      {analysis && (
        <aside
          aria-label="Quick assessment navigation dock"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-3 text-xs text-slate-700 animate-fadeIn no-print"
        >
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="font-bold text-slate-900 font-mono tabular-nums">{analysis.overall_match_score.toFixed(1)}% Match</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="#analysis-results"
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold transition-colors"
            >
              Summary
            </a>
            <a
              href="#evidence-matrix"
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold transition-colors"
            >
              Matrix
            </a>
            <a
              href="#roadmap-items-container"
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold transition-colors"
            >
              Roadmap
            </a>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Open command palette"
              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors ml-1"
            >
              ⌘K
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top of workspace"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors ml-1"
            >
              <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </aside>
      )}

      {/* Global Interactive Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}

export default function AnalyzerPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sm text-slate-500">Loading analyzer workspace...</div>}>
      <AnalyzerContent />
    </Suspense>
  );
}
