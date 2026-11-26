"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

interface FaqItem {
  id: string;
  category: "Architecture" | "Formulas" | "Accuracy" | "Usage";
  question: string;
  answer: string;
  formula?: string;
}

const FAQS: FaqItem[] = [
  {
    id: "sbert-vs-llm",
    category: "Architecture",
    question: "Why use Sentence-BERT (all-MiniLM-L6-v2) instead of a generative LLM like GPT-4?",
    answer:
      "Generative LLMs are prone to hallucination, non-deterministic scoring (varying outputs on repeated runs), and high latency/token costs. Sentence-BERT provides a lightweight (384-dimensional dense vector) semantic embedding space that deterministically computes mathematical cosine similarity in under 15ms. Combined with spaCy's PhraseMatcher for exact dictionary lookup, our system achieves 0% hallucination and 100% reproducible scoring.",
  },
  {
    id: "gap-index-math",
    category: "Formulas",
    question: "How is the Role Skill-Gap Index (G) mathematically computed?",
    answer:
      "The Role Skill-Gap Index G represents the normalized competency deficit across all weighted requirements for a given job profile. An exact match contributes a score of 1.0; a semantic match contributes its cosine similarity s_j; and an absent competency contributes 0.0.",
    formula: "G = 1.0 - ( \\sum_{j=1}^{M} w_j \\cdot s_j ) / ( \\sum_{j=1}^{M} w_j )",
  },
  {
    id: "prerequisite-sequencing",
    category: "Formulas",
    question: "How does the system prevent circular dependencies in the learning roadmap?",
    answer:
      "The roadmap uses a Directed Acyclic Graph (DAG) with tie-breaking foundation bonuses (+0.25) and readiness penalties (-0.15). If a foundational skill (such as Python) is absent, dependent frameworks (such as FastAPI or PyTorch) incur a readiness penalty so students master prerequisites before attempting advanced topics.",
    formula: "p_j = w_j \\cdot (1.0 - s_j) + \\text{foundation\\_bonus} - \\text{readiness\\_penalty}",
  },
  {
    id: "symbol-protection",
    category: "Accuracy",
    question: "How does the ingestion engine protect symbols like C++, C#, .NET, and CI/CD?",
    answer:
      "Standard natural language tokenizers use destructive regex patterns (such as \\w+) that strip punctuation, corrupting 'C++' into 'C' and 'CI/CD' into two separate words. Our ingestion engine applies pre-tokenization regex lookaheads that explicitly preserve recognized multi-character technical monikers.",
  },
  {
    id: "file-formats",
    category: "Usage",
    question: "What document formats are supported for resume analysis?",
    answer:
      "The system natively ingests Adobe PDF files (via PyMuPDF / fitz), Microsoft Word documents (.docx via python-docx), and raw plain-text / markdown files. Formatting headers and bullet delimiters are normalized into clean structured sentences for semantic vectorization.",
  },
  {
    id: "audit-compliance",
    category: "Usage",
    question: "Can assessment results be exported for accreditation or HR audit logs?",
    answer:
      "Yes. Every assessment produces a clean, print-optimized decision-support document via the 'Print / Save PDF' action (⌘P), and all runs are persisted with SQLite/SQLAlchemy in the Audit History database for retrospective reporting.",
  },
];

export default function FaqSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    "sbert-vs-llm": true,
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="craft-card rounded-2xl p-6 sm:p-8 space-y-7 border border-slate-200 bg-white" id="faq-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md mb-2">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Methodology &amp; FAQ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl [text-wrap:pretty]">
            Key architectural, mathematical, and algorithmic principles governing the deterministic analyzer.
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-slate-200">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No matching questions found for &ldquo;{searchQuery}&rdquo;. Try another term.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = !!openIds[faq.id];

            return (
              <div key={faq.id} className="py-4 space-y-2">
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left gap-4 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {faq.question}
                    </span>
                  </div>

                  <span className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="pt-2 pl-3 pr-2 text-xs text-slate-600 space-y-3 animate-fadeIn">
                    <p className="leading-relaxed [text-wrap:pretty]">{faq.answer}</p>
                    {faq.formula && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-indigo-700 font-bold">
                        {faq.formula}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
