"use client";

import React from "react";
import Link from "next/link";
import FaqSection from "@/components/FaqSection";
import { HelpCircle, ArrowRight, BookOpen, GraduationCap } from "lucide-react";

export default function FaqPage() {
  return (
    <div className="space-y-12 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Academic Knowledge Base</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
          Frequently Asked Questions
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:pretty]">
          Explore the mathematical, architectural, and educational principles governing 
          the <strong>spaCy + Sentence-BERT</strong> skill gap analyzer.
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
            <BookOpen className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>View Architecture Whitepaper</span>
          </Link>
        </div>
      </section>

      {/* Main FAQ Component */}
      <FaqSection />

      {/* Research & Ethical Scope Callout */}
      <div className="craft-card rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200 bg-white">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Academic &amp; Decision-Support Scope
            </h2>
            <p className="text-xs text-slate-500">
              Responsible AI design guidelines in career counseling and technical education
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed [text-wrap:pretty]">
          This software is engineered specifically as a formative decision-support tool to guide student learning trajectories, 
          identify curriculum deficits, and suggest sequenced study roadmaps. It is explicitly not designed or intended as an automated 
          hiring filter, gatekeeper, or discriminatory evaluation mechanism.
        </p>
      </div>
    </div>
  );
}
