"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Flame,
  Play,
  RefreshCw,
} from "lucide-react";

interface CompetencyDef {
  id: string;
  name: string;
  weight: number;
  importance: "Must Have" | "Important";
  isFoundation?: boolean;
}

interface SandboxRole {
  id: string;
  title: string;
  description: string;
  competencies: CompetencyDef[];
  presets: {
    label: string;
    description: string;
    states: Record<string, "acquired" | "partial" | "missing">;
  }[];
}

const SANDBOX_ROLES: SandboxRole[] = [
  {
    id: "backend_developer",
    title: "Backend Developer",
    description: "Evaluates API design, relational data modeling, caching, and container orchestration.",
    competencies: [
      { id: "python", name: "Python Core", weight: 0.18, importance: "Must Have", isFoundation: true },
      { id: "fastapi", name: "FastAPI / ASGI", weight: 0.16, importance: "Must Have" },
      { id: "postgresql", name: "PostgreSQL & SQL", weight: 0.15, importance: "Must Have", isFoundation: true },
      { id: "docker", name: "Docker Containers", weight: 0.12, importance: "Important" },
      { id: "rest_api", name: "RESTful API Architecture", weight: 0.12, importance: "Must Have" },
      { id: "redis", name: "Redis Caching", weight: 0.09, importance: "Important" },
      { id: "unit_testing", name: "Unit Testing (Pytest)", weight: 0.10, importance: "Important" },
      { id: "git", name: "Git & Version Control", weight: 0.08, importance: "Important" },
    ],
    presets: [
      {
        label: "Junior Graduate",
        description: "Python and Git known, missing backend frameworks and DevOps.",
        states: {
          python: "acquired",
          fastapi: "missing",
          postgresql: "partial",
          docker: "missing",
          rest_api: "partial",
          redis: "missing",
          unit_testing: "missing",
          git: "acquired",
        },
      },
      {
        label: "Mid-Level Contributor",
        description: "Solid web & DB foundations; ready to tackle Redis & testing.",
        states: {
          python: "acquired",
          fastapi: "acquired",
          postgresql: "acquired",
          docker: "partial",
          rest_api: "acquired",
          redis: "missing",
          unit_testing: "partial",
          git: "acquired",
        },
      },
      {
        label: "Senior Production Ready",
        description: "Comprehensive mastery across all 8 architectural requirements.",
        states: {
          python: "acquired",
          fastapi: "acquired",
          postgresql: "acquired",
          docker: "acquired",
          rest_api: "acquired",
          redis: "acquired",
          unit_testing: "acquired",
          git: "acquired",
        },
      },
    ],
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    description: "Evaluates exploratory analysis, statistical rigor, and machine learning pipelines.",
    competencies: [
      { id: "python", name: "Python Analytics", weight: 0.18, importance: "Must Have", isFoundation: true },
      { id: "pandas", name: "Pandas & Data Wrangling", weight: 0.16, importance: "Must Have" },
      { id: "scikit_learn", name: "Scikit-Learn ML", weight: 0.16, importance: "Must Have" },
      { id: "statistics_probability", name: "Statistics & Probability", weight: 0.14, importance: "Must Have", isFoundation: true },
      { id: "sql", name: "SQL Analytics", weight: 0.12, importance: "Important" },
      { id: "numpy", name: "NumPy Vectorization", weight: 0.12, importance: "Important" },
      { id: "data_visualization", name: "Data Visualization", weight: 0.12, importance: "Important" },
    ],
    presets: [
      {
        label: "Business Analyst Transition",
        description: "Strong SQL and Stats, learning Python & Scikit-Learn pipelines.",
        states: {
          python: "partial",
          pandas: "partial",
          scikit_learn: "missing",
          statistics_probability: "acquired",
          sql: "acquired",
          numpy: "missing",
          data_visualization: "acquired",
        },
      },
      {
        label: "Practicing Data Scientist",
        description: "End-to-end predictive modeling with solid ML foundations.",
        states: {
          python: "acquired",
          pandas: "acquired",
          scikit_learn: "acquired",
          statistics_probability: "acquired",
          sql: "acquired",
          numpy: "acquired",
          data_visualization: "acquired",
        },
      },
    ],
  },
  {
    id: "ml_engineer",
    title: "Machine Learning Engineer",
    description: "Evaluates deep learning architectures, scalable inference, and MLOps deployment.",
    competencies: [
      { id: "python", name: "Python for Deep Learning", weight: 0.15, importance: "Must Have", isFoundation: true },
      { id: "pytorch", name: "PyTorch Framework", weight: 0.18, importance: "Must Have" },
      { id: "mlops", name: "MLOps & Model Registry", weight: 0.15, importance: "Must Have" },
      { id: "machine_learning", name: "Classical ML Theory", weight: 0.14, importance: "Must Have", isFoundation: true },
      { id: "docker", name: "Docker Containerization", weight: 0.12, importance: "Important" },
      { id: "fastapi", name: "FastAPI Model Serving", weight: 0.10, importance: "Important" },
      { id: "data_structures_algorithms", name: "DSA & System Design", weight: 0.08, importance: "Important" },
    ],
    presets: [
      {
        label: "Software Engineer to ML",
        description: "Fluent in Python, Docker, APIs; mastering PyTorch & MLOps.",
        states: {
          python: "acquired",
          pytorch: "partial",
          mlops: "missing",
          machine_learning: "partial",
          docker: "acquired",
          fastapi: "acquired",
          data_structures_algorithms: "acquired",
        },
      },
      {
        label: "Full-Stack ML Engineer",
        description: "Scalable inference, training pipelines, and production deployments.",
        states: {
          python: "acquired",
          pytorch: "acquired",
          mlops: "acquired",
          machine_learning: "acquired",
          docker: "acquired",
          fastapi: "acquired",
          data_structures_algorithms: "acquired",
        },
      },
    ],
  },
];

interface InteractiveSandboxProps {
  onSelectRoleInWorkspace?: (roleId: string) => void;
}

export default function InteractiveSandbox({ onSelectRoleInWorkspace }: InteractiveSandboxProps) {
  const [activeRoleId, setActiveRoleId] = useState<string>("backend_developer");
  const [hasRun, setHasRun] = useState<boolean>(false);

  const activeRole = useMemo(
    () => SANDBOX_ROLES.find((r) => r.id === activeRoleId) || SANDBOX_ROLES[0],
    [activeRoleId]
  );

  // Initialize clean without pre-filled mock data
  const [skillStates, setSkillStates] = useState<Record<string, "acquired" | "partial" | "missing">>(() => {
    const initial: Record<string, "acquired" | "partial" | "missing"> = {};
    SANDBOX_ROLES[0].competencies.forEach((c) => {
      initial[c.id] = "missing";
    });
    return initial;
  });

  // Switch role handler: resets states to clean initial state
  const handleSwitchRole = (roleId: string) => {
    setActiveRoleId(roleId);
    setHasRun(false);
    const target = SANDBOX_ROLES.find((r) => r.id === roleId);
    if (target) {
      const reset: Record<string, "acquired" | "partial" | "missing"> = {};
      target.competencies.forEach((c) => {
        reset[c.id] = "missing";
      });
      setSkillStates(reset);
    }
  };

  const handleSetState = (compKey: string, val: "acquired" | "partial" | "missing") => {
    setSkillStates((prev) => ({ ...prev, [compKey]: val }));
  };

  const handleApplyPreset = (presetStates: Record<string, "acquired" | "partial" | "missing">) => {
    setSkillStates({ ...presetStates });
    setHasRun(true);
  };

  const handleReset = () => {
    const cleared: Record<string, "acquired" | "partial" | "missing"> = {};
    activeRole.competencies.forEach((c) => {
      cleared[c.id] = "missing";
    });
    setSkillStates(cleared);
    setHasRun(false);
  };

  const handleRunSimulation = () => {
    setHasRun(true);
  };

  // Mathematical Real-Time Computations
  const stats = useMemo(() => {
    let totalWeight = 0;
    let earnedWeight = 0;
    let acquiredCount = 0;
    let partialCount = 0;
    let missingCount = 0;

    const scoredCompetencies = activeRole.competencies.map((comp) => {
      const state = skillStates[comp.id] || "missing";
      let scoreVal = 0.0;
      if (state === "acquired") {
        scoreVal = 1.0;
        acquiredCount++;
      } else if (state === "partial") {
        scoreVal = 0.65;
        partialCount++;
      } else {
        missingCount++;
      }

      totalWeight += comp.weight;
      earnedWeight += comp.weight * scoreVal;

      // Priority ranking: p_j = w_j * (1 - s_j) + foundation_bonus (+0.25)
      const deficit = 1.0 - scoreVal;
      const foundationBonus = comp.isFoundation && deficit > 0.1 ? 0.25 : 0.0;
      const priorityScore = comp.weight * deficit + foundationBonus;

      return {
        ...comp,
        state,
        scoreVal,
        deficit,
        priorityScore,
      };
    });

    const matchPercent = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
    const gapIndex = totalWeight > 0 ? 1.0 - earnedWeight / totalWeight : 1.0;

    // Sort missing/partial skills by priority score descending to identify top recommendation
    const highPriorityNext = scoredCompetencies
      .filter((c) => c.state !== "acquired")
      .sort((a, b) => b.priorityScore - a.priorityScore)[0];

    return {
      totalWeight,
      earnedWeight,
      matchPercent,
      gapIndex,
      acquiredCount,
      partialCount,
      missingCount,
      highPriorityNext,
      scoredCompetencies,
    };
  }, [activeRole, skillStates]);

  // Circular gauge SVG calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.matchPercent / 100) * circumference;

  const scoreTheme =
    stats.matchPercent >= 75
      ? { stroke: "#10b981", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", badge: "Interview Ready" }
      : stats.matchPercent >= 50
      ? { stroke: "#f59e0b", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", badge: "Candidate in Progress" }
      : { stroke: "#ef4444", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", badge: "Substantial Gap" };

  const handleLaunchWorkspace = () => {
    if (onSelectRoleInWorkspace) {
      onSelectRoleInWorkspace(activeRoleId);
    }
  };

  return (
    <div className="craft-card rounded-2xl p-6 sm:p-8 space-y-7 border border-slate-200 bg-white" id="interactive-sandbox">
      {/* Header & Role Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md mb-2">
            <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
            Interactive Simulation Playground
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Role Competency Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl [text-wrap:pretty]">
            Select proficiencies or test presets, then click <strong>Run Simulation</strong> to compute the 
            <strong> Role Gap Index (G)</strong> and prerequisite priority rankings deterministically.
          </p>
        </div>

        {/* Role Segmented Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 self-start lg:self-center">
          {SANDBOX_ROLES.map((r) => {
            const isSelected = r.id === activeRoleId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSwitchRole(r.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  isSelected
                    ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {r.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Scenarios & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
          <span className="font-bold text-slate-900">Try Scenario Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeRole.presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset.states)}
              title={preset.description}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 font-medium transition-colors inline-flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600"
            title="Reset all competencies to missing"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Competency Interactive Toggles (Left) + Dynamic Decision Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Interactive Competencies (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs pb-1 text-slate-500">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Role Competencies ({activeRole.competencies.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
              >
                <Play className="w-3 h-3 fill-white" aria-hidden="true" />
                <span>{hasRun ? "Recalculate Alignment" : "Run Simulation"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {stats.scoredCompetencies.map((comp) => {
              const state = comp.state;
              const isAcquired = state === "acquired";
              const isPartial = state === "partial";
              const isMissing = state === "missing";

              return (
                <div
                  key={comp.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    hasRun
                      ? isAcquired
                        ? "bg-emerald-50/40 border-emerald-200"
                        : isPartial
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-slate-50/60 border-slate-200"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{comp.name}</span>
                      {comp.isFoundation && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                          Foundation Blocker (+0.25)
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        w = {comp.weight.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {comp.importance === "Must Have" ? (
                        <span className="text-rose-600 font-semibold">Must-Have Requirement</span>
                      ) : (
                        <span className="text-slate-600">Important Competency</span>
                      )}
                    </div>
                  </div>

                  {/* 3-State Radio Buttons */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleSetState(comp.id, "acquired")}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                        isAcquired
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Acquired (1.0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetState(comp.id, "partial")}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                        isPartial
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Partial (0.65)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetState(comp.id, "missing")}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                        isMissing
                          ? "bg-slate-700 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Missing (0.0)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Calculated Decision Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {!hasRun ? (
            /* Unran Initial Prompt State */
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Sliders className="w-8 h-8" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Ready to Simulate
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto [text-wrap:pretty]">
                  Select competency proficiencies on the left or click a scenario preset above, 
                  then execute the simulation to compute alignment metrics.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <Play className="w-4 h-4 fill-white" aria-hidden="true" />
                <span>Run Simulation &amp; Calculate Alignment</span>
              </button>

              <p className="text-[11px] text-slate-400">
                Computes Gap Index ($G$), alignment percentage, and priority tie-breaking.
              </p>
            </div>
          ) : (
            /* Calculated Results State when ran */
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Calculated Role Alignment
                </span>
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  <span>Update</span>
                </button>
              </div>

              {/* Live Animated Circular SVG Gauge */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
                  {/* Background Track */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  {/* Animated Value Stroke */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="transparent"
                    stroke={scoreTheme.stroke}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-2xl font-black font-mono tabular-nums tracking-tight ${scoreTheme.text}`}>
                    {stats.matchPercent.toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Match Score
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center pt-1">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${scoreTheme.bg} ${scoreTheme.text} ${scoreTheme.border}`}>
                  {scoreTheme.badge}
                </span>
              </div>

              {/* Gap Index & Breakdown Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Role Gap Index (G)
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 tabular-nums">
                    {stats.gapIndex.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Deficit normalized</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Competency Status
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 tabular-nums">
                    {stats.acquiredCount}/{stats.scoredCompetencies.length}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {stats.partialCount} Partial &bull; {stats.missingCount} Missing
                  </span>
                </div>
              </div>

              {/* Top Recommended Priority Callout */}
              {stats.highPriorityNext ? (
                <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                    <Flame className="w-4 h-4 text-orange-500 shrink-0" aria-hidden="true" />
                    <span>Next Priority Recommendation</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{stats.highPriorityNext.name}</span>
                    <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Priority Score: {stats.highPriorityNext.priorityScore.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {stats.highPriorityNext.isFoundation
                      ? "Contains a +0.25 Foundation Blocker Bonus. Mastering this competency unlocks multiple higher-level prerequisites."
                      : "Carries substantial requirement weight with zero current coverage. Closing this delivers the highest alignment gain."}
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>
                    <strong>Full Alignment Achieved!</strong> Complete coverage across all {activeRole.title} requirements.
                  </span>
                </div>
              )}

              {/* CTA to Full Workspace */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLaunchWorkspace}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  <span>Audit Your Real Resume in Workspace</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Supports PDF, DOCX, and text resumes with zero generative hallucination.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
