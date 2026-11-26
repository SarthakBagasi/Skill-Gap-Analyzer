"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Briefcase,
  User,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  FileCode,
  ArrowRight,
  Code2,
  Database,
  Brain,
  Layers,
  Eraser,
  Wand2,
  Terminal,
} from "lucide-react";
import { RoleProfile } from "@/types/analysis";

interface InputPanelProps {
  roles: RoleProfile[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

interface Persona {
  id: string;
  name: string;
  roleId: string;
  badge: string;
  icon: any;
  color: string;
  skills: string[];
  resumeText: string;
  headline: string;
}

const PERSONAS: Persona[] = [
  {
    id: "backend_alex",
    name: "Alex Johnson",
    roleId: "backend_developer",
    badge: "Backend Developer",
    icon: Code2,
    color: "from-blue-600 to-indigo-600",
    skills: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Pytest"],
    headline: "Junior/Mid Backend Engineer aiming for Senior Microservices role",
    resumeText: `Alex Johnson - Backend Software Engineer
alex.johnson@email.com | github.com/alexj-dev | San Francisco, CA

PROFESSIONAL SUMMARY
Backend developer with 2+ years of experience engineering asynchronous REST web APIs and relational database architectures. Skilled in API contracts, containerized deployments, and test-driven development.

CORE TECHNICAL SKILLS
- Languages: Python, SQL, Bash shell scripting
- Web Frameworks & APIs: FastAPI, Django Rest Framework, RESTful API Design
- Databases & Storage: PostgreSQL, Redis (caching and pub/sub), relational schema design
- DevOps & Tools: Docker, Linux, Git version control, GitHub Actions CI/CD pipelines
- Verification: Pytest, Unit Testing, TDD methodologies

WORK EXPERIENCE
Backend Software Engineer | CloudTech Solutions (2023 - Present)
- Engineered 12+ RESTful microservices in FastAPI with automated OpenAPI specifications and Pydantic validation schemas.
- Optimized PostgreSQL relational queries using EXPLAIN ANALYZE, eliminating table scans and reducing query latency by 45%.
- Implemented Redis cache-aside layers to handle 20,000 requests per minute with sub-30ms response times.
- Authored automated unit test suites with 90% branch coverage using pytest and GitHub Actions.`,
  },
  {
    id: "data_priya",
    name: "Priya Sharma",
    roleId: "data_scientist",
    badge: "Data Scientist",
    icon: Database,
    color: "from-emerald-600 to-teal-600",
    skills: ["Pandas", "NumPy", "Scikit-Learn", "A/B Testing", "SQL", "Seaborn"],
    headline: "Statistical Analyst advancing into Predictive Machine Learning",
    resumeText: `Priya Sharma - Data Scientist & Statistical Analyst
priya.sharma@email.com | linkedin.com/in/priyasharma | New York, NY

PROFESSIONAL SUMMARY
Data scientist with an analytical foundation in predictive modeling, statistical inference, and exploratory data analysis. Proven track record translating raw datasets into actionable executive insights.

CORE TECHNICAL SKILLS
- Programming: Python, SQL (Analytical window functions, CTEs)
- Data Wrangling: Pandas, NumPy, data cleaning, normalization
- Machine Learning: Scikit-learn, supervised classification, regression models, cross-validation
- Statistical Theory: Statistics & Probability, hypothesis testing, A/B testing, power analysis
- Visualization & Tools: Data Visualization, Matplotlib, Seaborn, Git, Docker

KEY PROJECTS
Customer Churn Predictive Pipeline:
- Developed an end-to-end classifier using Scikit-Learn achieving 88% ROC-AUC on imbalanced cohort data.
- Built automated preprocessing pipelines handling missing values and feature scaling with Pandas and NumPy.
A/B Testing Statistical Experimentation Suite:
- Formulated two-sample hypothesis tests evaluating product conversion rate differences with strict 95% confidence intervals.`,
  },
  {
    id: "ml_marcus",
    name: "Marcus Vance",
    roleId: "ml_engineer",
    badge: "ML Engineer",
    icon: Brain,
    color: "from-purple-600 to-pink-600",
    skills: ["PyTorch", "Deep Learning", "FastAPI", "Docker", "MLOps", "MLflow"],
    headline: "Deep Learning Researcher transitioning into Production MLOps",
    resumeText: `Marcus Vance - Machine Learning Engineer
marcus.v@email.com | github.com/marcusv-ml | Seattle, WA

PROFESSIONAL SUMMARY
Machine Learning Engineer passionate about deep neural network architectures, GPU acceleration, and low-latency inference serving in production microservices.

CORE TECHNICAL SKILLS
- Programming Languages: Python, C++
- Deep Learning & AI: PyTorch, Neural Networks, Computer Vision (OpenCV), Transformers
- Model Serving & Infrastructure: Docker, FastAPI model inference, MLOps, MLflow model registry
- Engineering Foundations: Data Structures & Algorithms, Machine Learning fundamentals, Git

WORK EXPERIENCE
ML Systems Engineer | Visionary AI (2023 - Present)
- Trained and fine-tuned custom PyTorch convolutional neural networks for visual defect detection.
- Packaged deep learning inference models into optimized Docker containers served via asynchronous FastAPI endpoints.
- Managed model checkpoints, hyperparameters, and automated tracking metrics using MLflow.
- Profiled model inference latency, reducing CPU memory overhead by 35% through tensor quantization.`,
  },
];

const LOADING_STEPS = [
  "Parsing document & preserving technical tokens (C++, C#, .NET)…",
  "Running spaCy PhraseMatcher across 60+ canonical skills…",
  "Encoding Sentence-BERT embeddings (all-MiniLM-L6-v2)…",
  "Computing cosine similarity matrix & Exact match flags…",
  "Formulating Role Skill-Gap Index (G) & Prerequisite Roadmap…",
];

export default function InputPanel({
  roles,
  selectedRoleId,
  onSelectRole,
  onSubmit,
  isLoading,
}: InputPanelProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("backend_alex");
  const [candidateName, setCandidateName] = useState("Alex Johnson");
  const [inputMode, setInputMode] = useState<"text" | "upload">("text");
  const [resumeText, setResumeText] = useState(PERSONAS[0].resumeText);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [useCustomJD, setUseCustomJD] = useState(false);
  const [customJD, setCustomJD] = useState("");
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle loading step messages during active inference
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersonaId(persona.id);
    setCandidateName(persona.name);
    onSelectRole(persona.roleId);
    setResumeText(persona.resumeText);
    setInputMode("text");
    setSelectedFile(null);
    setUseCustomJD(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedPersonaId("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setSelectedPersonaId("");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;
  const charCount = resumeText.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("candidate_name", candidateName.trim() || "Candidate");

    if (useCustomJD && customJD.trim()) {
      formData.append("custom_job_description", customJD.trim());
    } else {
      formData.append("role_profile_id", selectedRoleId);
    }

    if (inputMode === "upload" && selectedFile) {
      formData.append("resume_file", selectedFile);
    } else {
      formData.append("resume_text", resumeText);
    }

    await onSubmit(formData);
  };

  return (
    <div className="craft-card rounded-2xl p-6 sm:p-8 lg:p-9 shadow-xs border border-slate-200">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-7 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" aria-hidden="true" />
            Candidate Skill Assessment Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl [text-wrap:pretty]">
            Select a candidate persona for an immediate demonstration or supply your own resume to evaluate semantic competency alignment against industry standards.
          </p>
        </div>

        {/* Engine specs badge */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-600 shrink-0">
          <Terminal className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          <span>
            Model: <strong className="font-mono text-slate-800">all-MiniLM-L6-v2</strong>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        </div>
      </div>

      {/* 1. Quick Persona Switcher Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5" id="persona-selection-label">
            <User className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            Interactive Candidate Personas (One-Click Testing)
          </span>
          <span className="text-[11px] text-slate-400">Click any card to auto-populate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5" role="group" aria-labelledby="persona-selection-label">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersonaId === p.id;

            return (
              <button
                key={p.id}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectPersona(p)}
                className={`text-left p-4 rounded-xl border transition-colors relative group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-indigo-50/30 border-indigo-600 shadow-xs ring-1 ring-indigo-600/30"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Active check pill */}
                {isSelected && (
                  <span className="absolute top-3 right-3 text-indigo-700 flex items-center gap-1 text-[10px] font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                    Active
                  </span>
                )}

                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0"
                    aria-hidden="true"
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {p.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-indigo-700">
                      {p.badge}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed [text-wrap:pretty]">
                  {p.headline}
                </p>

                <div className="flex flex-wrap gap-1">
                  {p.skills.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-700 px-2 py-0.5 rounded-md transition-colors"
                    >
                      {s}
                    </span>
                  ))}
                  {p.skills.length > 4 && (
                    <span className="text-[10px] font-mono text-slate-400 px-1 py-0.5">
                      +{p.skills.length - 4}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Candidate Name & Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="candidate-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                Candidate Name
              </span>
            </label>
            <input
              id="candidate-name-input"
              type="text"
              autoComplete="name"
              value={candidateName}
              onChange={(e) => {
                setCandidateName(e.target.value);
                setSelectedPersonaId("");
              }}
              placeholder="e.g. Alex Johnson"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 transition-colors shadow-2xs"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="role-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                  Target Career Role
                </span>
              </label>
              <button
                type="button"
                onClick={() => setUseCustomJD(!useCustomJD)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
              >
                <Wand2 className="w-3 h-3" aria-hidden="true" />
                {useCustomJD ? "Use Role Presets" : "+ Custom Job Description"}
              </button>
            </div>

            {!useCustomJD ? (
              <select
                id="role-select"
                value={selectedRoleId}
                onChange={(e) => {
                  onSelectRole(e.target.value);
                  setSelectedPersonaId("");
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 transition-colors shadow-2xs"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.requirements.length} Core Competencies)
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-indigo-800 bg-indigo-50 px-3.5 py-2.5 rounded-xl border border-indigo-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                <span>
                  Custom JD active: Requirements will be extracted on-the-fly via spaCy.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Custom Job Description Textarea if enabled */}
        {useCustomJD && (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-jd-textarea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Paste Job Description Specification
              </label>
              <span className="text-[11px] text-slate-400">
                Skills will be dynamically extracted and weighted equally
              </span>
            </div>
            <textarea
              id="custom-jd-textarea"
              rows={4}
              value={customJD}
              onChange={(e) => setCustomJD(e.target.value)}
              placeholder="e.g. We are seeking a Backend Engineer with hands-on experience in FastAPI, PostgreSQL, Docker, Redis caching, and Pytest unit testing…"
              className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-mono focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 transition-colors shadow-2xs"
              required={useCustomJD}
            />
          </div>
        )}

        {/* Resume Input Mode Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resume Ingestion Source
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium" role="tablist" aria-label="Resume input format modes">
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === "text"}
                onClick={() => setInputMode("text")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  inputMode === "text"
                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Raw Text
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === "upload"}
                onClick={() => setInputMode("upload")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  inputMode === "upload"
                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload PDF / DOCX
              </button>
            </div>
          </div>

          {/* Mode 1: Textarea with live stats */}
          {inputMode === "text" && (
            <div className="space-y-2">
              <div className="relative">
                <label htmlFor="resume-text-input" className="sr-only">
                  Paste resume or CV text
                </label>
                <textarea
                  id="resume-text-input"
                  rows={9}
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setSelectedPersonaId("");
                  }}
                  placeholder="Paste candidate resume text or CV summary here…"
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 transition-colors shadow-2xs"
                  required={inputMode === "text"}
                />

                {/* Quick actions top-right */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResumeText("");
                      setSelectedPersonaId("");
                    }}
                    aria-label="Clear resume text"
                    className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-lg text-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
                  >
                    <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Live stats footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <div className="flex items-center gap-3">
                  <span>
                    Words: <strong className="text-slate-700 tabular-nums font-mono">{wordCount}</strong>
                  </span>
                  <span aria-hidden="true">&bull;</span>
                  <span>
                    Chars: <strong className="text-slate-700 tabular-nums font-mono">{charCount}</strong>
                  </span>
                  <span aria-hidden="true">&bull;</span>
                  <span>Est. Read: ~{Math.ceil(wordCount / 200)}&nbsp;min</span>
                </div>
                <span className="text-indigo-600 font-medium">
                  Technical symbols C++, C#, .NET preserved automatically
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: Enhanced Drag & Drop File Upload */}
          {inputMode === "upload" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="resume-file-input"
              />

              {!selectedFile ? (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Drop resume file here, or press enter to browse files"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                    isDragOver
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20"
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-2xs" aria-hidden="true">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Drag and drop resume here, or <span className="text-indigo-600 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Supports high-fidelity parsing for PDF, DOCX, and TXT files (up to 10&nbsp;MB)
                  </p>

                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600">
                      .PDF (PyMuPDF)
                    </span>
                    <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600">
                      .DOCX (python-docx)
                    </span>
                    <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600">
                      .TXT (UTF-8)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs" aria-hidden="true">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="tabular-nums font-mono font-semibold">{(selectedFile.size / 1024).toFixed(1)}</span>&nbsp;KB &bull; Document validated &amp; ready for parsing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      aria-label="Remove uploaded file"
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button & Multi-stage Loading Ticker */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || (inputMode === "upload" && !selectedFile)}
            aria-busy={isLoading}
            className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-xs flex items-center justify-center gap-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <div role="status" aria-live="polite" className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-white" aria-hidden="true" />
                <span className="text-sm font-medium">
                  {LOADING_STEPS[loadingStepIdx]}
                </span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200" aria-hidden="true" />
                <span className="text-sm tracking-wide">
                  Execute Deterministic Skill Gap Analysis
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
