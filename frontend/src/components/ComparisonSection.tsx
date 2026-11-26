"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  AlertTriangle,
  Scale,
  Sparkles,
  Shield,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ComparisonFeature {
  name: string;
  category: "accuracy" | "explainability" | "growth" | "reliability";
  traditionalAts: {
    status: "bad" | "warning" | "good";
    text: string;
  };
  generativeLlm: {
    status: "bad" | "warning" | "good";
    text: string;
  };
  ourArchitecture: {
    status: "bad" | "warning" | "good";
    text: string;
  };
  deepDive: string;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Hallucination Rate & Consistency",
    category: "accuracy",
    traditionalAts: {
      status: "good",
      text: "0% Hallucination (Rigid substring grep)",
    },
    generativeLlm: {
      status: "bad",
      text: "5-15% Hallucination (Invents non-existent skills)",
    },
    ourArchitecture: {
      status: "good",
      text: "0% Hallucination (Deterministic spaCy + S-BERT embeddings)",
    },
    deepDive:
      "Generative LLMs frequently confabulate candidate proficiencies or misinterpret casual hobby mentions as production expertise. Our dual-matching pipeline guarantees that every skill requires an exact dictionary hit or cosine vector match >= 0.65.",
  },
  {
    name: "Synonym & Semantic Recognition",
    category: "accuracy",
    traditionalAts: {
      status: "bad",
      text: "Fails on synonyms (Rejects 'Postgres' for 'PostgreSQL')",
    },
    generativeLlm: {
      status: "good",
      text: "High conceptual recognition",
    },
    ourArchitecture: {
      status: "good",
      text: "High recognition via 60+ aliases & Sentence-BERT vectors",
    },
    deepDive:
      "Traditional ATS rejects candidates who write 'FastAPI web APIs' if the job description searches for 'REST API Architecture'. Our engine resolves aliases via spaCy PhraseMatcher and falls back to Sentence-BERT cosine similarity.",
  },
  {
    name: "Scoring Reproducibility",
    category: "reliability",
    traditionalAts: {
      status: "good",
      text: "100% Deterministic (Simple keyword counts)",
    },
    generativeLlm: {
      status: "bad",
      text: "Non-reproducible (Varies across temperature & API runs)",
    },
    ourArchitecture: {
      status: "good",
      text: "100% Deterministic (Mathematical Gap Index G formula)",
    },
    deepDive:
      "Educational institutions and audit bodies require consistent evaluations. An identical resume scored five times with our system yields the exact same numerical Gap Index down to 4 decimal places.",
  },
  {
    name: "Requirement-Level Evidence Snippets",
    category: "explainability",
    traditionalAts: {
      status: "bad",
      text: "None (Binary Pass / Fail black box)",
    },
    generativeLlm: {
      status: "warning",
      text: "Subjective prose without vector similarity math",
    },
    ourArchitecture: {
      status: "good",
      text: "Traceable sentence excerpts, cosine scores & rationales",
    },
    deepDive:
      "Every single requirement in the Evidence Matrix quotes the exact sentence from the candidate's resume, displays the match classification (Exact / Semantic / Deficit), and reports cosine proximity.",
  },
  {
    name: "Prerequisite Learning Sequences",
    category: "growth",
    traditionalAts: {
      status: "bad",
      text: "None (Only built for gatekeeping & automated rejection)",
    },
    generativeLlm: {
      status: "warning",
      text: "Generic un-sequenced bullet lists",
    },
    ourArchitecture: {
      status: "good",
      text: "Sequenced DAG with Foundation Bonuses & study pacing",
    },
    deepDive:
      "Instead of a cold rejection letter, students receive a structured curriculum ranking core building blocks first, complete with official documentation links and estimated study hours.",
  },
  {
    name: "Protected Technical Symbols",
    category: "accuracy",
    traditionalAts: {
      status: "bad",
      text: "C++, C#, .NET, CI/CD stripped into C, NET, CI CD",
    },
    generativeLlm: {
      status: "good",
      text: "Understands punctuation in context",
    },
    ourArchitecture: {
      status: "good",
      text: "Regex Guardian shields non-alphanumeric technical tokens",
    },
    deepDive:
      "Our PyMuPDF and docx parsers pass raw text through regex lookaheads that explicitly prevent tokenizers from truncating C++ to C or .NET to NET.",
  },
];

export default function ComparisonSection() {
  const [activeTab, setActiveTab] = useState<"all" | "accuracy" | "explainability" | "growth" | "reliability">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFeatures =
    activeTab === "all"
      ? COMPARISON_FEATURES
      : COMPARISON_FEATURES.filter((f) => f.category === activeTab);

  const renderStatus = (status: "good" | "warning" | "bad", text: string) => {
    if (status === "good") {
      return (
        <div className="flex items-start gap-2">
          <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs text-slate-800 font-medium">{text}</span>
        </div>
      );
    }
    if (status === "warning") {
      return (
        <div className="flex items-start gap-2">
          <span className="p-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs text-slate-700 font-medium">{text}</span>
        </div>
      );
    }
    return (
      <div className="flex items-start gap-2">
        <span className="p-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0 mt-0.5">
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
        <span className="text-xs text-slate-500 line-through">{text}</span>
      </div>
    );
  };

  return (
    <div className="craft-card rounded-2xl p-6 sm:p-8 space-y-7 border border-slate-200 bg-white" id="comparison-section">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md mb-2">
          <Scale className="w-3.5 h-3.5" aria-hidden="true" />
          Architectural Differentiation
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Why Deterministic AI Outperforms Legacy ATS &amp; LLMs
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl [text-wrap:pretty]">
          Compare our hybrid <strong>spaCy + Sentence-BERT</strong> approach against traditional corporate ATS screeners 
          and unbounded generative LLM prompts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 w-fit">
        {[
          { id: "all", label: "All Benchmarks" },
          { id: "accuracy", label: "Accuracy & Hallucinations" },
          { id: "explainability", label: "Explainability & Auditing" },
          { id: "growth", label: "Career Growth" },
          { id: "reliability", label: "Reliability & Speed" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
              activeTab === tab.id
                ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3.5 px-4 font-bold text-slate-900 w-1/4">Evaluation Dimension</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 w-1/4">Traditional ATS Gatekeeper</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 w-1/4">Generative LLMs (e.g., GPT-4)</th>
              <th className="py-3.5 px-4 font-bold text-indigo-700 bg-indigo-50/60 w-1/4">
                Our Deterministic AI Architecture
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredFeatures.map((feat, idx) => {
              const isExpanded = expandedIndex === idx;

              return (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{feat.name}</span>
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                          aria-label={`Toggle deep dive for ${feat.name}`}
                          className="text-slate-400 hover:text-indigo-600 ml-2"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 bg-slate-50/20">
                      {renderStatus(feat.traditionalAts.status, feat.traditionalAts.text)}
                    </td>
                    <td className="py-3.5 px-4 bg-slate-50/20">
                      {renderStatus(feat.generativeLlm.status, feat.generativeLlm.text)}
                    </td>
                    <td className="py-3.5 px-4 bg-indigo-50/30">
                      {renderStatus(feat.ourArchitecture.status, feat.ourArchitecture.text)}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-indigo-50/20">
                      <td colSpan={4} className="p-4 border-t border-slate-200 text-xs text-slate-700">
                        <div className="flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <p className="leading-relaxed">
                            <strong>Architectural Deep Dive:</strong> {feat.deepDive}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
