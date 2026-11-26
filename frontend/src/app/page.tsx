"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommandPalette, { CommandItem } from "@/components/CommandPalette";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sliders,
  Cpu,
  Layers,
  FileText,
  History,
  BookOpen,
  Keyboard,
  User,
  Calculator,
  Compass,
  TrendingUp,
  FileCheck2,
  ChevronRight,
  Check,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Keyboard accessibility for global Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen]);

  // Global Command Palette items
  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-analyzer",
        title: "Go to Analyzer Workspace",
        category: "Navigation",
        description: "Upload resume (PDF, DOCX) or test candidate personas",
        icon: FileText,
        action: () => router.push("/analyzer"),
        shortcut: "W",
      },
      {
        id: "nav-sandbox",
        title: "Go to Competency Sandbox",
        category: "Navigation",
        description: "Interactive real-time Gap Index simulator and SVG gauge",
        icon: Sliders,
        action: () => router.push("/sandbox"),
        shortcut: "S",
      },
      {
        id: "nav-architecture",
        title: "Go to 3-Stage Pipeline Architecture",
        category: "Navigation",
        description: "Inspect Token Guardian, spaCy + S-BERT engine, and DAG",
        icon: Cpu,
        action: () => router.push("/architecture"),
        shortcut: "A",
      },
      {
        id: "nav-compare",
        title: "Go to System Comparison",
        category: "Navigation",
        description: "Traditional ATS vs Generative LLM vs Deterministic AI",
        icon: Layers,
        action: () => router.push("/compare"),
        shortcut: "C",
      },
      {
        id: "nav-history",
        title: "Go to Saved Audit History",
        category: "Navigation",
        description: "Inspect historical candidate assessments and reports",
        icon: History,
        action: () => router.push("/history"),
        shortcut: "H",
      },
      {
        id: "nav-faq",
        title: "Go to Methodology & FAQ",
        category: "Navigation",
        description: "Frequently asked questions and mathematical formulas",
        icon: BookOpen,
        action: () => router.push("/faq"),
        shortcut: "F",
      },
      {
        id: "persona-alex",
        title: "Load Persona: Alex Johnson",
        category: "Personas",
        description: "Backend Developer (FastAPI, PostgreSQL, Redis, Docker)",
        icon: User,
        action: () => router.push("/analyzer?role=backend_developer"),
        shortcut: "1",
      },
      {
        id: "persona-priya",
        title: "Load Persona: Priya Sharma",
        category: "Personas",
        description: "Data Scientist (Pandas, Scikit-Learn, Statistics, SQL)",
        icon: User,
        action: () => router.push("/analyzer?role=data_scientist"),
        shortcut: "2",
      },
      {
        id: "persona-marcus",
        title: "Load Persona: Marcus Vance",
        category: "Personas",
        description: "Machine Learning Engineer (PyTorch, MLOps, Docker, FastAPI)",
        icon: User,
        action: () => router.push("/analyzer?role=ml_engineer"),
        shortcut: "3",
      },
    ],
    [router]
  );

  return (
    <div className="space-y-20 py-4 max-w-6xl mx-auto">
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8" aria-label="Hero Overview">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
          <span>Deterministic NLP Pipeline &bull; Zero Generative Hallucinations</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
          AI-Powered Skill Gap Analyzer &amp; Prioritized Career Roadmap
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:pretty]">
          Empowering candidates and academic institutions with explainable career alignment. Benchmark technical 
          resumes against industry requirements using <strong>spaCy PhraseMatcher</strong>, <strong>Sentence-BERT cosine similarity</strong>, 
          and <strong>prerequisite-aware DAG sequencing</strong>.
        </p>

        {/* Trust Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            100% Deterministic Reproducibility
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            &lt;15ms Dense Vector Embeddings
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
            Symbol Protection (C++, C#, .NET, CI/CD)
          </span>
        </div>

        {/* Hero Interactive CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            href="/analyzer"
            className="text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-2 group"
          >
            <span>Launch Analyzer Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>

          <Link
            href="/sandbox"
            className="text-xs sm:text-sm font-bold px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
            <span>Try Live Sandbox</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Open keyboard command palette"
            className="text-xs font-semibold px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-2"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
            <span>Quick Actions</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-700">⌘K</kbd>
          </button>
        </div>
      </section>

      {/* 2. Platform Capability Pages Grid */}
      <section aria-label="Explore Platform Modules" className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Comprehensive Career Intelligence Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated spaces designed for each stage of competency evaluation and decision-support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Resume Analyzer Workspace */}
          <Link
            href="/analyzer"
            className="craft-card craft-card-interactive rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-200 bg-white block group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                CORE WORKSPACE
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <span>Resume Analyzer Workspace</span>
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600" aria-hidden="true" />
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed [text-wrap:pretty]">
                Ingest PDF/DOCX resumes or test pre-configured candidate personas (Backend, Data Science, ML Engineer). 
                Computes mathematical Gap Index ($G$), Evidence Tables, and prioritized learning sequences.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>Open Analyzer Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 2: Interactive Sandbox */}
          <Link
            href="/sandbox"
            className="craft-card craft-card-interactive rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-200 bg-white block group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Sliders className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                SIMULATION LAB
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <span>Interactive Competency Sandbox</span>
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600" aria-hidden="true" />
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed [text-wrap:pretty]">
                Toggle candidate competencies across Acquired, Partial, and Missing states without uploading a resume. 
                Features a real-time circular SVG gauge and instant prerequisite recommendations.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
              <span>Launch Competency Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 3: 3-Stage Pipeline Architecture */}
          <Link
            href="/architecture"
            className="craft-card craft-card-interactive rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-200 bg-white block group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Cpu className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                ALGORITHM EXPLORER
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <span>3-Stage NLP Architecture</span>
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600" aria-hidden="true" />
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed [text-wrap:pretty]">
                Inspect the Token Guardian regex lookaheads (protecting C++, .NET), the Sentence-BERT cosine proximity cutoff 
                slider ($\tau = 0.65$), and the prerequisite tie-breaking DAG.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span>Inspect Architecture Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 4: Benchmark Comparison */}
          <Link
            href="/compare"
            className="craft-card craft-card-interactive rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-200 bg-white block group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                SYSTEM BENCHMARKS
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <span>ATS &amp; LLM Comparison Matrix</span>
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600" aria-hidden="true" />
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed [text-wrap:pretty]">
                Side-by-side benchmark comparing traditional keyword ATS screeners vs. unbounded generative LLM prompts vs. 
                our deterministic dual-matching engine across 6 core criteria.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
              <span>View System Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Three Deterministic Deliverables Preview */}
      <section className="craft-card rounded-2xl p-8 sm:p-10 space-y-8 border border-slate-200 bg-white" aria-label="Assessment Output Deliverables">
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Explainable Decision Support
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Every Assessment Generates Three Audit-Grade Artifacts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Designed for institutional transparency, student mentorship, and self-paced upskilling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 font-mono">ARTIFACT 1</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Role Gap Index (G) &amp; Visual Analytics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed [text-wrap:pretty]">
              Normalized deficit index G = 1.0 - (&Sigma; (w_j &middot; s_j) / &Sigma; w_j) paired with 
              multi-dimensional competency radar charts and a live What-If upskilling simulator.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 font-mono">ARTIFACT 2</span>
              <FileCheck2 className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Explainability Proximity Matrix
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed [text-wrap:pretty]">
              Granular per-requirement audit displaying exact dictionary phrase matches vs. Sentence-BERT cosine 
              similarity scores ($\tau \ge 0.65$), with candidate sentence evidence snippets.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 font-mono">ARTIFACT 3</span>
              <Compass className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Prioritized Learning Roadmap
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed [text-wrap:pretty]">
              Prerequisite-aware study sequence applying foundation blocker bonuses ($+0.25$) so students master 
              core building blocks before complex frameworks, with interactive study pacing and tasks.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Knowledge Base & FAQ Teaser */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-100 p-8 rounded-2xl border border-slate-200">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
            <span>Academic Knowledge Base</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Have questions regarding formulas, Sentence-BERT, or DAG sequencing?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Read our detailed FAQ section covering the mathematical formulations, tokenizer regex protection, 
            and why deterministic embeddings eliminate LLM hallucinations.
          </p>
        </div>

        <Link
          href="/faq"
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs transition-colors shrink-0 flex items-center gap-2"
        >
          <span>Browse Knowledge Base</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </section>

      {/* 5. Final Workspace CTA Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Ready to Benchmark Your Career Competencies?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Upload your resume in PDF or DOCX format or select one of our test engineering personas to receive 
          an instant, explainable skill gap audit and sequenced upskilling roadmap.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/analyzer"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-colors flex items-center gap-2"
          >
            <span>Launch Resume Analyzer Workspace</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/history"
            className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>View Saved Audit History</span>
          </Link>
        </div>
      </section>

      {/* Global Interactive Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}
