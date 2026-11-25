"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  BookOpen,
  ExternalLink,
  Clock,
  Award,
  Layers,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Copy,
  Check,
  Terminal,
  Trophy,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { LearningRoadmapItem } from "@/types/analysis";

interface LearningRoadmapProps {
  roadmap: LearningRoadmapItem[];
}

export default function LearningRoadmap({ roadmap }: LearningRoadmapProps) {
  // Persistent practice task checkboxes via localStorage
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [activePhaseTab, setActivePhaseTab] = useState<"all" | "foundation" | "core" | "advanced">("all");

  // Load completed tasks on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("skill_analyzer_tasks");
      if (saved) {
        setCompletedTasks(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem("skill_analyzer_tasks", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Group roadmap items into 3 structured learning phases
  const phasedRoadmap = useMemo(() => {
    const phase1: LearningRoadmapItem[] = []; // Foundation blockers & high priority
    const phase2: LearningRoadmapItem[] = []; // Core frameworks
    const phase3: LearningRoadmapItem[] = []; // Advanced systems & polish

    roadmap.forEach((item, index) => {
      if (item.priority_rank <= 2 || item.prerequisites.length === 0) {
        phase1.push(item);
      } else if (item.difficulty === "Advanced" || item.priority_rank > 5) {
        phase3.push(item);
      } else {
        phase2.push(item);
      }
    });

    return { phase1, phase2, phase3 };
  }, [roadmap]);

  // Total tasks & hours calculation
  const totalTasksCount = useMemo(() => {
    return roadmap.reduce((acc, item) => acc + (item.practice_tasks?.length || 0), 0);
  }, [roadmap]);

  const completedCount = useMemo(() => {
    let count = 0;
    roadmap.forEach((item) => {
      item.practice_tasks?.forEach((_, tidx) => {
        if (completedTasks[`${item.skill_id}_task_${tidx}`]) count++;
      });
    });
    return count;
  }, [roadmap, completedTasks]);

  const totalEstimatedHours = useMemo(() => {
    return roadmap.reduce((acc, item) => acc + (item.estimated_hours || 15), 0);
  }, [roadmap]);

  const progressPercentage = totalTasksCount > 0
    ? Math.round((completedCount / totalTasksCount) * 100)
    : 0;

  // Filter roadmap based on phase tab
  const displayedItems = useMemo(() => {
    if (activePhaseTab === "foundation") return phasedRoadmap.phase1;
    if (activePhaseTab === "core") return phasedRoadmap.phase2;
    if (activePhaseTab === "advanced") return phasedRoadmap.phase3;
    return roadmap;
  }, [roadmap, phasedRoadmap, activePhaseTab]);

  const handleCopyStudyPlan = () => {
    let md = `# Personalized Career Upskilling Roadmap\n\n`;
    md += `Target Objectives: ${roadmap.length} Skills | Estimated Effort: ~${totalEstimatedHours} Hours\n\n`;

    roadmap.forEach((item) => {
      md += `## #${item.priority_rank} ${item.title} (${item.skill_name})\n`;
      md += `- **Difficulty:** ${item.difficulty} | **Effort:** ~${item.estimated_hours}h\n`;
      md += `- **Objective:** ${item.objective}\n`;
      md += `- **Official Documentation:** ${item.official_docs}\n`;
      md += `- **Topics:** ${item.topics.join(", ")}\n`;
      md += `- **Hands-on Exercises:**\n`;
      item.practice_tasks.forEach((t) => {
        md += `  - [ ] ${t}\n`;
      });
      md += `- **Portfolio Artifact:** ${item.artifacts}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="craft-card rounded-2xl p-10 text-center border-emerald-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Award className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Zero Skill Gaps Detected
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto [text-wrap:pretty]">
          The candidate profile strongly satisfies all required competencies for this target role.
        </p>
      </div>
    );
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Advanced":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Intermediate":
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Gamified Roadmap Header & Interactive Progress Banner */}
      <div className="craft-card rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600 shrink-0" aria-hidden="true" />
              Prioritized Learning &amp; Upskilling Roadmap
            </h3>
            <p className="text-xs text-slate-500 mt-1 [text-wrap:pretty]">
              Deterministic sequence generated using Priority Formula: <span className="font-mono text-slate-700 font-semibold">Priority = (Weight × Gap) + Foundational Bonus</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyStudyPlan}
              aria-label="Copy entire study plan in Markdown format"
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden"
            >
              {copiedPlan ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copied Study Guide!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Study Guide (Markdown)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Progress Meter */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 font-mono tabular-nums shadow-xs">
              {progressPercentage}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Interactive Exercise Progress:
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 tabular-nums">
                  {completedCount} of {totalTasksCount} completed
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Check off tasks as you practice. Progress is automatically saved in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <Clock className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>Total Effort: <strong className="font-mono tabular-nums text-slate-900">~{totalEstimatedHours}h</strong></span>
            </span>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter roadmap learning stages"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1" id="phase-tabs-label">
            Learning Stages:
          </span>
          <button
            type="button"
            role="tab"
            aria-selected={activePhaseTab === "all"}
            aria-controls="roadmap-items-container"
            onClick={() => setActivePhaseTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden ${
              activePhaseTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            All Gaps (<span className="tabular-nums font-mono">{roadmap.length}</span>)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePhaseTab === "foundation"}
            aria-controls="roadmap-items-container"
            onClick={() => setActivePhaseTab("foundation")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 focus:outline-hidden ${
              activePhaseTab === "foundation"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700"
            }`}
          >
            Phase 1: Foundations (<span className="tabular-nums font-mono">{phasedRoadmap.phase1.length}</span>)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePhaseTab === "core"}
            aria-controls="roadmap-items-container"
            onClick={() => setActivePhaseTab("core")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus:outline-hidden ${
              activePhaseTab === "core"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 hover:bg-amber-100 text-amber-700"
            }`}
          >
            Phase 2: Core Frameworks (<span className="tabular-nums font-mono">{phasedRoadmap.phase2.length}</span>)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePhaseTab === "advanced"}
            aria-controls="roadmap-items-container"
            onClick={() => setActivePhaseTab("advanced")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus:outline-hidden ${
              activePhaseTab === "advanced"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 hover:bg-purple-100 text-purple-700"
            }`}
          >
            Phase 3: Systems Specialization (<span className="tabular-nums font-mono">{phasedRoadmap.phase3.length}</span>)
          </button>
        </div>
      </div>

      {/* Action Cards List */}
      <div id="roadmap-items-container" className="space-y-5">
        {displayedItems.map((item: LearningRoadmapItem) => {
          const isMissing = item.gap_type === "Missing Skill";

          return (
            <div
              key={item.skill_id}
              className="craft-card rounded-xl p-6 sm:p-7 hover:border-indigo-300 transition-colors space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs font-mono tabular-nums mt-0.5">
                    #{item.priority_rank}
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>
                        Canonical Skill: <strong className="text-slate-800">{item.skill_name}</strong>
                      </span>
                      <span aria-hidden="true">&bull;</span>
                      <span>Category: {item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isMissing
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {item.gap_type}
                  </span>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${getDifficultyBadge(
                      item.difficulty
                    )}`}
                  >
                    {item.difficulty}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span className="font-mono tabular-nums">~{item.estimated_hours}h</span>
                  </span>
                </div>
              </div>

              {/* Foundation-First / Prerequisite Callouts */}
              {item.unmet_prerequisites && item.unmet_prerequisites.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="font-bold">Prerequisite Notice:</strong>{" "}
                    This skill builds on foundations in{" "}
                    <span className="font-mono font-bold bg-amber-100 px-2 py-0.5 rounded text-amber-950">
                      {item.unmet_prerequisites.join(", ")}
                    </span>
                    . We recommend reviewing those foundational concepts in tandem.
                  </div>
                </div>
              )}

              {/* Measurable Objective */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Measurable Competency Objective
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed [text-wrap:pretty]">
                  {item.objective}
                </p>
              </div>

              {/* Core Curriculum Topics */}
              {item.topics && item.topics.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                    Core Curriculum Concepts
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.topics.map((topic, tidx) => (
                      <span
                        key={tidx}
                        className="text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Practice Tasks with persistence */}
              {item.practice_tasks && item.practice_tasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Interactive Hands-On Practice Exercises
                  </span>
                  <div className="space-y-2" role="group" aria-label={`Practice tasks for ${item.title}`}>
                    {item.practice_tasks.map((task, tidx) => {
                      const taskId = `${item.skill_id}_task_${tidx}`;
                      const isDone = !!completedTasks[taskId];

                      return (
                        <label
                          key={tidx}
                          className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors cursor-pointer select-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 ${
                            isDone
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleTask(taskId)}
                            className="sr-only"
                          />
                          <span className="shrink-0 mt-0.5">
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" aria-hidden="true" />
                            )}
                          </span>
                          <span className={isDone ? "line-through opacity-75" : ""}>
                            {task}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tangible Portfolio Artifact & Documentation Link */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FolderGit2 className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                  <span>
                    <strong>Portfolio Deliverable:</strong> {item.artifacts}
                  </span>
                </div>

                <a
                  href={item.official_docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Official Documentation for ${item.skill_name} (opens in new tab)`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200 transition-colors shrink-0 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  Official Documentation
                  <ExternalLink className="w-3 h-3 ml-0.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
