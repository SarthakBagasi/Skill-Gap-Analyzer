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
      <div className="glass-panel rounded-3xl p-10 text-center shadow-xs border-emerald-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Award className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Zero Skill Gaps Detected!
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
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
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1">
              <Compass className="w-3.5 h-3.5" />
              Traceable Career Action Plan
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Prioritized Learning & Upskilling Roadmap
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequence generated using Priority Formula (Weight × Gap + Foundation bonus)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyStudyPlan}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5"
            >
              {copiedPlan ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Study Guide!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Study Guide (Markdown)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Progress Meter */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0 font-mono">
              {progressPercentage}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Interactive Exercise Progress:
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {completedCount} of {totalTasksCount} completed
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Check off tasks as you practice. Progress is automatically saved in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Total Effort: ~{totalEstimatedHours} Hours
            </span>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Learning Stages:
          </span>
          <button
            type="button"
            onClick={() => setActivePhaseTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activePhaseTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            All Gaps ({roadmap.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePhaseTab("foundation")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activePhaseTab === "foundation"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700"
            }`}
          >
            Phase 1: Foundations ({phasedRoadmap.phase1.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePhaseTab("core")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activePhaseTab === "core"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 hover:bg-amber-100 text-amber-700"
            }`}
          >
            Phase 2: Core Frameworks ({phasedRoadmap.phase2.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePhaseTab("advanced")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activePhaseTab === "advanced"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 hover:bg-purple-100 text-purple-700"
            }`}
          >
            Phase 3: Systems Specialization ({phasedRoadmap.phase3.length})
          </button>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-5">
        {displayedItems.map((item: LearningRoadmapItem) => {
          const isMissing = item.gap_type === "Missing Skill";

          return (
            <div
              key={item.skill_id}
              className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xs hover:border-indigo-300 transition-all space-y-5 border-slate-200"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm shadow-indigo-300 font-mono mt-0.5">
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
                      <span>•</span>
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
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    ~{item.estimated_hours}h
                  </span>
                </div>
              </div>

              {/* Foundation-First / Prerequisite Callouts */}
              {item.unmet_prerequisites && item.unmet_prerequisites.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Prerequisite Notice:</strong>{" "}
                    This skill builds on foundations in{" "}
                    <span className="font-mono font-bold bg-amber-100/80 px-2 py-0.5 rounded text-amber-950">
                      {item.unmet_prerequisites.join(", ")}
                    </span>
                    . We recommend reviewing those foundational concepts in tandem.
                  </div>
                </div>
              )}

              {/* Measurable Objective */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Measurable Competency Objective
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
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
                        className="text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs transition"
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
                  <div className="space-y-2">
                    {item.practice_tasks.map((task, tidx) => {
                      const taskId = `${item.skill_id}_task_${tidx}`;
                      const isDone = !!completedTasks[taskId];

                      return (
                        <button
                          key={tidx}
                          type="button"
                          onClick={() => toggleTask(taskId)}
                          className={`w-full text-left p-3 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                            isDone
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={isDone ? "line-through opacity-75" : ""}>
                            {task}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tangible Portfolio Artifact & Documentation Link */}
              <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FolderGit2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Portfolio Deliverable:</strong> {item.artifacts}
                  </span>
                </div>

                <a
                  href={item.official_docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200 transition shrink-0 shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Official Documentation
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
