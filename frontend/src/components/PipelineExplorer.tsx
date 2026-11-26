"use client";

import React, { useState } from "react";
import {
  FileCode,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Binary,
  Sliders,
  Sparkles,
  GitCommit,
  Network,
  Compass,
} from "lucide-react";

export default function PipelineExplorer() {
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);

  // Stage 1 Interactive State
  const [sampleText, setSampleText] = useState(
    "Senior Engineer designing CI/CD workflows using C++, C#, .NET 8, and Node.js microservices."
  );

  // Stage 2 Interactive State
  const [selectedCandidateSnippet, setSelectedCandidateSnippet] = useState<
    "exact" | "semantic_pass" | "semantic_fail"
  >("semantic_pass");
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.65);

  const snippetMap = {
    exact: {
      text: "Engineered scalable REST microservices with FastAPI and Pydantic validation schemas.",
      cosine: 1.0,
      matchType: "Exact Dictionary Phrase Match",
      description: "spaCy PhraseMatcher matched canonical alias 'fastapi' directly.",
    },
    semantic_pass: {
      text: "Designed high-throughput asynchronous web endpoints using Starlette ASGI and OpenAPI.",
      cosine: 0.82,
      matchType: "Sentence-BERT Semantic Cosine Match",
      description: "all-MiniLM-L6-v2 vector embeddings yield high conceptual proximity (0.82 >= threshold).",
    },
    semantic_fail: {
      text: "Built frontend user interfaces using React, Redux Toolkit, and Tailwind CSS.",
      cosine: 0.41,
      matchType: "Sub-Threshold Semantic Distance",
      description: "Semantic proximity is below threshold (0.41 < threshold), correctly flagged as deficit.",
    },
  };

  const currentSnippet = snippetMap[selectedCandidateSnippet];
  const isMatchPassing = currentSnippet.cosine >= similarityThreshold;

  // Stage 3 Interactive DAG State
  const [selectedDagNode, setSelectedDagNode] = useState<"python" | "fastapi" | "docker">("python");

  const dagNodes = {
    python: {
      title: "Python 3.11+ Core Language",
      type: "Foundation Blocker",
      weight: 0.18,
      status: "Missing in Candidate Profile",
      bonus: "+0.25 (Prerequisite Foundation Bonus)",
      penalty: "0.00 (Zero prerequisites required)",
      calculatedPriority: 0.43,
      rationale:
        "Python is a direct dependency for FastAPI and Pytest. To maximize student learning velocity, the recommender prioritizes Python first with a foundation bonus.",
      unlocks: ["FastAPI / ASGI Microservices", "Pytest Suite & Unit Testing"],
    },
    fastapi: {
      title: "FastAPI / ASGI Framework",
      type: "Framework Competency",
      weight: 0.16,
      status: "Missing in Candidate Profile",
      bonus: "0.00 (Does not block downstream core)",
      penalty: "-0.15 (Readiness Penalty if Python is missing)",
      calculatedPriority: 0.16,
      rationale:
        "FastAPI requires intermediate Python fluency. If Python is absent, a temporary readiness penalty ensures the candidate does not get frustrated starting with advanced frameworks.",
      unlocks: ["Production Microservice Architecture"],
    },
    docker: {
      title: "Docker Containerization",
      type: "DevOps Competency",
      weight: 0.12,
      status: "Missing in Candidate Profile",
      bonus: "0.00 (Independent Infrastructure Skill)",
      penalty: "0.00 (Can be studied concurrently)",
      calculatedPriority: 0.12,
      rationale:
        "Containerization is an orthogonal engineering competency. It is scheduled in Phase 2 alongside database modeling.",
      unlocks: ["CI/CD Pipeline Deployment", "Cloud Orchestration"],
    },
  };

  return (
    <div className="craft-card rounded-2xl p-6 sm:p-8 space-y-7 border border-slate-200 bg-white" id="pipeline-explorer">
      {/* Section Header */}
      <div className="pb-5 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md mb-2">
          <Network className="w-3.5 h-3.5" aria-hidden="true" />
          Zero-Hallucination Architecture
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Deterministic 3-Stage NLP Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl [text-wrap:pretty]">
          Explore the exact mathematical and algorithmic pipeline under the hood. Unlike generative LLMs that invent skills, 
          our engine relies on deterministic phrase matching and Sentence-BERT vector embeddings.
        </p>
      </div>

      {/* Stage Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveStage(1)}
          className={`p-4 rounded-xl border text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
            activeStage === 1
              ? "bg-indigo-50/70 border-indigo-300 shadow-2xs"
              : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              STAGE 1
            </span>
            <FileCode className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Document Ingestion &amp; Token Guardian</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Preserves symbols (C++, C#, .NET, CI/CD) from destructive regex truncation.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveStage(2)}
          className={`p-4 rounded-xl border text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
            activeStage === 2
              ? "bg-indigo-50/70 border-indigo-300 shadow-2xs"
              : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              STAGE 2
            </span>
            <Cpu className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Hybrid spaCy + S-BERT Engine</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Dictionary exact matching + 384-dimensional cosine semantic vectors.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveStage(3)}
          className={`p-4 rounded-xl border text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
            activeStage === 3
              ? "bg-indigo-50/70 border-indigo-300 shadow-2xs"
              : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              STAGE 3
            </span>
            <Layers className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Prerequisite Sequencing DAG</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Mathematical priority ranking with foundation blocker tie-breaking.
          </p>
        </button>
      </div>

      {/* Stage 1 Content: Ingestion & Regex Token Guardian */}
      {activeStage === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="token-input" className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                Live Token Guardian Ingestion Preview
              </label>
              <span className="text-[11px] text-slate-500">Edit text below to test regex tokenization</span>
            </div>

            <input
              id="token-input"
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Standard destructive ATS tokenizer */}
            <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                  Standard ATS Tokenizer (\w+ only)
                </span>
                <span className="text-[10px] font-bold text-rose-600 uppercase">Information Loss</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard parsers strip non-alphanumeric punctuation. <code>C++</code> turns into <code>C</code>, 
                <code>C#</code> turns into <code>C</code>, and <code>CI/CD</code> splits into two unrelated words.
              </p>
              <div className="bg-white p-3 rounded-lg border border-rose-200 text-xs font-mono text-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Extracted Tokens:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Senior", "Engineer", "designing", "CI", "CD", "workflows", "using", "C", "C", "NET", "8", "and", "Node", "js"].map(
                    (tok, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded text-[11px] ${
                          ["CI", "CD", "C", "NET", "js"].includes(tok)
                            ? "bg-rose-100 text-rose-700 font-bold border border-rose-200 line-through"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {tok}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Deterministic Regex Guardian */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  Deterministic Token-Preserving Guardian
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">100% Fidelity</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our custom tokenizer uses non-destructive lookaheads to guard multi-character symbols and framework names 
                prior to spaCy matcher evaluation.
              </p>
              <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs font-mono text-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Preserved Competencies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["CI/CD", "C++", "C#", ".NET", "Node.js"].map((tok, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[11px]"
                    >
                      ✓ {tok}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2 Content: Hybrid spaCy + Sentence-BERT Engine */}
      {activeStage === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Target Requirement Context */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Target Role Requirement:</span>
              <strong className="text-slate-900 font-mono text-sm">FastAPI / High-Performance REST APIs</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Semantic Cosine Threshold (&tau;):</span>
              <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-1 rounded border border-slate-200">
                {similarityThreshold.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Interactive Candidate Phrasing Selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Simulate Candidate Resume Phrasing:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedCandidateSnippet("exact")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedCandidateSnippet === "exact"
                    ? "bg-white border-indigo-500 shadow-2xs ring-1 ring-indigo-500"
                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded block w-fit mb-1">
                  EXACT PHRASE MATCH
                </span>
                <p className="text-xs text-slate-800 line-clamp-2">
                  &ldquo;Engineered microservices with FastAPI and Pydantic schemas&rdquo;
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCandidateSnippet("semantic_pass")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedCandidateSnippet === "semantic_pass"
                    ? "bg-white border-indigo-500 shadow-2xs ring-1 ring-indigo-500"
                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded block w-fit mb-1">
                  SEMANTIC COSINE MATCH
                </span>
                <p className="text-xs text-slate-800 line-clamp-2">
                  &ldquo;Built asynchronous endpoints using Starlette ASGI and OpenAPI&rdquo;
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCandidateSnippet("semantic_fail")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedCandidateSnippet === "semantic_fail"
                    ? "bg-white border-indigo-500 shadow-2xs ring-1 ring-indigo-500"
                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded block w-fit mb-1">
                  UNRELATED SKILL GAP
                </span>
                <p className="text-xs text-slate-800 line-clamp-2">
                  &ldquo;Built frontend user interfaces using React and Redux Toolkit&rdquo;
                </p>
              </button>
            </div>
          </div>

          {/* Interactive Threshold Slider */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="threshold-slider" className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                Adjust Cosine Cutoff Threshold (&tau; = {similarityThreshold.toFixed(2)})
              </label>
              <span className="text-[11px] text-slate-500">Standard Baseline: 0.65</span>
            </div>
            <input
              id="threshold-slider"
              type="range"
              min="0.45"
              max="0.90"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Evaluation Outcome Display */}
          <div
            className={`p-5 rounded-xl border space-y-3 ${
              isMatchPassing
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                : "bg-rose-50/50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                {isMatchPassing ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
                )}
                <div>
                  <h4 className="text-xs font-bold">{currentSnippet.matchType}</h4>
                  <span className="text-[11px] opacity-80">{currentSnippet.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="font-bold">Cosine Similarity:</span>
                <span className={`px-2.5 py-1 rounded font-bold ${isMatchPassing ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                  {currentSnippet.cosine.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/80">
              Candidate Resume Excerpt: &ldquo;{currentSnippet.text}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Stage 3 Content: Prerequisite DAG & Tie-Breaking Engine */}
      {activeStage === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">Deterministic Priority Mathematical Equation:</span>
            <code className="text-indigo-700 font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 inline-block">
              p_j = w_j &middot; (1.0 - s_j) + foundation_bonus - readiness_penalty
            </code>
            <p className="text-slate-500 text-[11px] pt-1">
              Ensures foundation blockers (+0.25) are recommended before dependent frameworks, avoiding circular deadlocks.
            </p>
          </div>

          {/* Interactive DAG Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(dagNodes) as (keyof typeof dagNodes)[]).map((key) => {
              const node = dagNodes[key];
              const isSelected = selectedDagNode === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDagNode(key)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                      {node.type}
                    </span>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      p = {node.calculatedPriority.toFixed(2)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{node.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                    <div>Bonus: <span className="font-mono text-emerald-600 font-bold">{node.bonus}</span></div>
                    <div>Penalty: <span className="font-mono text-rose-600 font-bold">{node.penalty}</span></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Decision Deep Dive */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Algorithmic Rationale: {dagNodes[selectedDagNode].title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Calculated Priority: <strong className="font-mono text-indigo-700">{dagNodes[selectedDagNode].calculatedPriority.toFixed(2)}</strong> &bull; Requirement Weight: <strong className="font-mono">{dagNodes[selectedDagNode].weight.toFixed(2)}</strong>
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 self-start sm:self-auto">
                {dagNodes[selectedDagNode].type}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {dagNodes[selectedDagNode].rationale}
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 text-[11px] block uppercase">
                Downstream Competencies Unlocked Upon Completion:
              </span>
              <div className="flex flex-wrap gap-2">
                {dagNodes[selectedDagNode].unlocks.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium text-[11px]"
                  >
                    <ArrowRight className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
