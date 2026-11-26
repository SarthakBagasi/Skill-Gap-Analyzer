"use client";

import React from "react";
import Link from "next/link";
import ComparisonSection from "@/components/ComparisonSection";
import { Scale, ArrowRight, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";

export default function ComparePage() {
  return (
    <div className="space-y-12 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <Scale className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>System Benchmarks &amp; Differentiation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
          Deterministic AI vs. Legacy ATS vs. LLMs
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:pretty]">
          Why educational self-assessment requires bounded mathematical evaluation. 
          Discover how our dual-matching pipeline avoids the false negatives of legacy ATS and the hallucinations of generative models.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/analyzer"
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-2"
          >
            <span>Launch Resume Analyzer</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/architecture"
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors flex items-center gap-2"
          >
            <span>Inspect 3-Stage Pipeline</span>
          </Link>
        </div>
      </section>

      {/* Trust Metrics Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>0% Hallucinations</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every match is grounded in strict dictionary lookup or Sentence-BERT cosine similarity $\ge 0.65$. No confabulated competencies.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>100% Deterministic</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Repeated audits of identical resumes yield the exact same Role Gap Index ($G$) down to 4 decimal places.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase">
            <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sub-15ms Latency</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dense 384-dimensional vector calculations execute locally on CPU in milliseconds without external API costs or rate limits.
          </p>
        </div>
      </div>

      {/* Main Comparison Component */}
      <ComparisonSection />
    </div>
  );
}
