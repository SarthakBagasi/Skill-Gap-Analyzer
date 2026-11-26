"use client";

import React from "react";
import Link from "next/link";
import PipelineExplorer from "@/components/PipelineExplorer";
import { Cpu, ArrowRight, ShieldCheck, Calculator, Network } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="space-y-12 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Technical Whitepaper &amp; Pipeline</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
          Deterministic 3-Stage NLP Architecture
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:pretty]">
          An end-to-end audit of how resumes are ingested, matched, and sequenced. 
          Combines token-preserving regex parsing, <strong>spaCy PhraseMatcher</strong> dictionary lookup, 
          and <strong>Sentence-BERT dense vector embeddings</strong> with zero generative hallucination.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/analyzer"
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-2"
          >
            <span>Run Assessment in Workspace</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/compare"
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Benchmark vs. ATS &amp; LLMs</span>
          </Link>
        </div>
      </section>

      {/* Interactive 3-Stage Pipeline Explorer */}
      <PipelineExplorer />

      {/* Mathematical Framework Deep Dive */}
      <section className="craft-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 bg-white">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calculator className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Mathematical Formulations &amp; Academic Rigor
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic formulations implemented in backend Python services
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 text-sm block">
              1. Role Skill-Gap Index (G) Formulation
            </span>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-indigo-700 font-bold">
              G = 1.0 - ( &Sigma; (w_j &middot; s_j) / &Sigma; w_j )
            </div>
            <p className="text-slate-600 leading-relaxed [text-wrap:pretty]">
              $G \in [0.0, 1.0]$ represents normalized competency deficit. Exact matches yield $s_j = 1.0$; 
              semantic vector matches compute cosine similarity $s_j \in [0.45, 1.0]$; absent skills evaluate to $s_j = 0.0$.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 text-sm block">
              2. Priority Ranking &amp; Prerequisite Tie-Breaking
            </span>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-indigo-700 font-bold">
              p_j = w_j &middot; (1.0 - s_j) + foundation_bonus - readiness_penalty
            </div>
            <p className="text-slate-600 leading-relaxed [text-wrap:pretty]">
              Missing competencies that serve as direct prerequisites for other missing skills receive a 
              foundation bonus ($+0.25$). Dependent skills receive a readiness penalty ($-0.15$) if foundations are missing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
