import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { History, ShieldAlert, Cpu, ArrowUpRight, Award, Compass } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "AI-Based Skill Gap Analyzer | Career Decision-Support System",
  description:
    "An explainable career skill assessment and recommendation decision-support tool using NLP and Sentence-BERT semantic matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        {/* Academic Prototype Notice & Ethical Guardrail Bar */}
        <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2.5 border-b border-slate-800 relative z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                <strong>Career Decision-Support Prototype:</strong> Designed strictly for
                student upskilling self-assessment. Not an ATS hiring filter or candidate certification gate.
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-400" />
                spaCy + Sentence-BERT (Deterministic)
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Zero Generative Hallucination</span>
            </div>
          </div>
        </div>

        {/* Global Navigation Header with Glassmorphism */}
        <header className="glass-panel sticky top-0 z-30 border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <BrandLogo size="md" showText={true} />
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition"
              >
                Analyzer Workspace
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition"
              >
                <History className="w-4 h-4 text-slate-400" />
                Audit History
              </Link>
              <a
                href="#how-it-works"
                className="hidden md:inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition"
              >
                NLP Methodology
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
            </nav>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>

        {/* Polished Tech Footer */}
        <footer className="glass-panel border-t border-slate-200/80 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" showText={false} />
              <div>
                <p className="font-semibold text-slate-700">
                  AI-Based Skill Gap Analyzer: An Intelligent Career Skill Assessment and Recommendation System
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Framed strictly as an explainable career decision-support tool. Never hallucinated.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-[11px]">
              <span className="font-mono">spaCy PhraseMatcher</span>
              <span>•</span>
              <span className="font-mono">Sentence-BERT all-MiniLM-L6-v2</span>
              <span>•</span>
              <span className="font-mono">SQLAlchemy / PostgreSQL</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
