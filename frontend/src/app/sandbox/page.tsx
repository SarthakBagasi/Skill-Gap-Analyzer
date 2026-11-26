"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InteractiveSandbox from "@/components/InteractiveSandbox";
import { Sliders, ArrowRight, Sparkles, HelpCircle } from "lucide-react";

export default function SandboxPage() {
  const router = useRouter();

  const handleSelectRoleInWorkspace = (roleId: string) => {
    router.push(`/analyzer?role=${roleId}`);
  };

  return (
    <div className="space-y-10 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <Sliders className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Real-Time Simulation Lab</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
          Interactive Competency Sandbox
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:pretty]">
          Experiment with skill combinations in real time. Observe how the <strong>Role Gap Index (G)</strong>, 
          overall weighted match score, and prerequisite DAG rankings adjust with zero latency.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/analyzer"
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-2"
          >
            <span>Switch to Real Resume Analyzer</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/architecture"
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>How the Algorithm Operates</span>
          </Link>
        </div>
      </section>

      {/* Main Interactive Playground */}
      <InteractiveSandbox onSelectRoleInWorkspace={handleSelectRoleInWorkspace} />
    </div>
  );
}
