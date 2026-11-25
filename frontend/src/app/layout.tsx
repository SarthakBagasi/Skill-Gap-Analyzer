import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { History, ShieldAlert, Cpu, ArrowUpRight } from "lucide-react";
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
      <body className="antialiased flex flex-col min-h-screen text-slate-900 bg-slate-50">
        {/* Accessible Skip to Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 text-xs font-bold"
        >
          Skip to main content
        </a>

        {/* Academic Prototype Notice & Ethical Guardrail Bar */}
        <aside
          aria-label="Ethical Guardrail & Prototype Notice"
          className="bg-slate-950 text-slate-200 text-xs px-4 py-2 border-b border-slate-800 relative z-40"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" aria-hidden="true" />
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="text-[11px] sm:text-xs">
                <strong className="text-white">Career Decision-Support Prototype:</strong> Designed strictly for student upskilling self-assessment. Not an automated hiring filter or certification engine.
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-indigo-400" aria-hidden="true" />
                spaCy + Sentence-BERT (Deterministic)
              </span>
              <span aria-hidden="true">•</span>
              <span className="text-emerald-400 font-medium">Zero Generative Hallucination</span>
            </div>
          </div>
        </aside>

        {/* Global Navigation Header */}
        <header className="bg-white/95 backdrop-blur-xs sticky top-0 z-30 border-b border-slate-200/90 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 group"
              aria-label="Skill Gap Analyzer Home"
            >
              <BrandLogo size="md" showText={true} />
            </Link>

            <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Main Navigation">
              <Link
                href="/"
                className="text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1"
              >
                Analyzer Workspace
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1"
              >
                <History className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" aria-hidden="true" />
                Audit History
              </Link>
              <a
                href="#how-it-works"
                className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                Methodology
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              </a>
            </nav>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>

        {/* Polished Tech Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" showText={false} />
              <div>
                <p className="font-semibold text-slate-800">
                  AI-Based Skill Gap Analyzer: An Intelligent Career Skill Assessment and Recommendation System
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Framed strictly as an explainable career decision-support tool. Never hallucinated.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-[11px]">
              <span className="font-mono text-slate-600">spaCy PhraseMatcher</span>
              <span aria-hidden="true">•</span>
              <span className="font-mono text-slate-600">Sentence-BERT all-MiniLM-L6-v2</span>
              <span aria-hidden="true">•</span>
              <span className="font-mono text-slate-600">SQLAlchemy / PostgreSQL</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
