"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { AnalysisResponse, MatchBreakdownItem } from "@/types/analysis";

// Dynamically import Recharts visualizations to prevent SSR vendor-chunk / window errors
const AnalyticsCharts = dynamic(() => import("./AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="glass-panel rounded-3xl p-8 border border-slate-200 h-80 flex flex-col items-center justify-center space-y-2">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      <p className="text-xs text-slate-500 font-medium">Initializing interactive visualizations...</p>
    </div>
  ),
});

interface GapSummaryCardsProps {
  analysis: AnalysisResponse;
  onFilterClick?: (status: string) => void;
}

export default function GapSummaryCards({
  analysis,
  onFilterClick,
}: GapSummaryCardsProps) {
  const {
    gap_index,
    gap_index_percentage,
    overall_match_score,
    strong_matches_count,
    partial_matches_count,
    missing_skills_count,
    total_requirements_count,
    role_profile_title,
    match_breakdown,
  } = analysis;

  // What-If Upskilling Simulator State
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [simulatedSkills, setSimulatedSkills] = useState<Record<string, boolean>>({});

  const handleResetSimulator = () => {
    setSimulatedSkills({});
  };

  const toggleSimulatedSkill = (skillId: string) => {
    setSimulatedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  // Recalculate What-If Simulated Alignment & Gap Index
  const simulationResults = useMemo(() => {
    let totalWeight = 0;
    let baseWeightedScore = 0;
    let simWeightedScore = 0;
    let newlyAcquiredCount = 0;

    match_breakdown.forEach((item) => {
      totalWeight += item.weight;
      let effectiveScore = 0;
      if (item.status === "Strong Match") {
        effectiveScore = 1.0;
      } else if (item.status === "Partial Match") {
        effectiveScore = item.similarity_score * 0.7;
      }

      baseWeightedScore += item.weight * effectiveScore;

      // In simulation mode, if student checked this skill, boost score to 1.0 (Strong Match)
      if (simulatedSkills[item.skill_id]) {
        simWeightedScore += item.weight * 1.0;
        newlyAcquiredCount++;
      } else {
        simWeightedScore += item.weight * effectiveScore;
      }
    });

    const normBaseScore = totalWeight > 0 ? (baseWeightedScore / totalWeight) * 100 : 0;
    const normSimScore = totalWeight > 0 ? (simWeightedScore / totalWeight) * 100 : 0;
    const simGapIndex = Math.max(0, 1.0 - (simWeightedScore / totalWeight));
    const scoreGain = normSimScore - normBaseScore;

    return {
      simulatedScore: normSimScore,
      simulatedGapIndex: simGapIndex,
      scoreGain: scoreGain,
      newlyAcquiredCount,
    };
  }, [match_breakdown, simulatedSkills]);

  // Current display scores (either simulated or actual)
  const displayScore = simulatorActive && simulationResults.newlyAcquiredCount > 0
    ? simulationResults.simulatedScore
    : overall_match_score;

  const displayGapIndex = simulatorActive && simulationResults.newlyAcquiredCount > 0
    ? simulationResults.simulatedGapIndex
    : gap_index;

  // Category Aggregates for Radar Chart
  const radarData = useMemo(() => {
    const categories: Record<string, { totalWeight: number; candidateScore: number; count: number }> = {};

    match_breakdown.forEach((item) => {
      const cat = item.category || "General";
      if (!categories[cat]) {
        categories[cat] = { totalWeight: 0, candidateScore: 0, count: 0 };
      }
      categories[cat].totalWeight += item.weight;
      categories[cat].count += 1;

      // Effective score
      let score = 0;
      if (item.status === "Strong Match") score = 100;
      else if (item.status === "Partial Match") score = Math.round(item.similarity_score * 70);

      // What-if boost
      if (simulatorActive && simulatedSkills[item.skill_id]) {
        score = 100;
      }

      categories[cat].candidateScore += score * item.weight;
    });

    return Object.entries(categories).map(([catName, data]) => ({
      category: catName.length > 18 ? `${catName.slice(0, 16)}…` : catName,
      fullCategory: catName,
      candidate: data.totalWeight > 0 ? Math.round(data.candidateScore / data.totalWeight) : 0,
      required: 100, // benchmark 100%
    }));
  }, [match_breakdown, simulatorActive, simulatedSkills]);

  // Category Pie Data
  const pieData = useMemo(() => {
    const cats: Record<string, number> = {};
    match_breakdown.forEach((item) => {
      cats[item.category] = (cats[item.category] || 0) + Math.round(item.weight * 100);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [match_breakdown]);

  // Bar spectrum data
  const spectrumData = useMemo(() => {
    return match_breakdown.map((item) => {
      const isSimulated = simulatorActive && simulatedSkills[item.skill_id];
      const effectiveScore = isSimulated
        ? 100
        : Math.round(item.similarity_score * 100);

      return {
        name: item.skill_name.length > 15 ? `${item.skill_name.slice(0, 13)}…` : item.skill_name,
        fullName: item.skill_name,
        score: effectiveScore,
        status: isSimulated ? "Strong Match (Simulated)" : item.status,
        matchType: item.match_type,
        weight: Math.round(item.weight * 100),
      };
    });
  }, [match_breakdown, simulatorActive, simulatedSkills]);

  // SVG Gauge calculations
  const radius = 62;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* 1. Top Performance Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Circular Gauge & Gap Index */}
        <div className="craft-card rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Role Skill-Gap Index (G)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                displayGapIndex <= 0.25
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : displayGapIndex <= 0.50
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {displayGapIndex <= 0.25 ? "Minimal Gap" : displayGapIndex <= 0.50 ? "Moderate Gap" : "Critical Gap"}
            </span>
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums">
                  {displayGapIndex.toFixed(3)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Deficit: <strong className="text-slate-800 tabular-nums">{(displayGapIndex * 100).toFixed(1)}%</strong>
              </p>
              {simulatorActive && simulationResults.scoreGain > 0 && (
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 tabular-nums">
                  +{simulationResults.scoreGain.toFixed(1)}% Simulated Gain
                </span>
              )}
            </div>

            {/* Circular Gauge Graphic */}
            <div className="relative flex items-center justify-center">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90" aria-hidden="true">
                <circle
                  stroke="#e2e8f0"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  stroke={displayScore >= 75 ? "#059669" : displayScore >= 50 ? "#d97706" : "#e11d48"}
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset, transition: "stroke-dashoffset 0.8s ease" }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-extrabold text-slate-900 font-mono tabular-nums">
                  {Math.round(displayScore)}%
                </span>
                <span className="block text-[8px] uppercase tracking-tighter text-slate-400 font-bold">
                  Match
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Overall Alignment:</span>
            <span className="font-extrabold text-indigo-600 font-mono text-xs tabular-nums">
              {displayScore.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 2: Strong Matches */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick("Strong Match")}
          aria-label={`View ${strong_matches_count} strong matching requirements`}
          className="craft-card text-left rounded-xl p-5 shadow-xs border-slate-200 hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Strong Matches
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform" aria-hidden="true">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 tracking-tight font-mono tabular-nums">
                {strong_matches_count}
              </span>
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                / {total_requirements_count} required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Exact tokens & high-cosine semantic equivalents.
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2" aria-hidden="true">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{
                width: `${total_requirements_count > 0 ? (strong_matches_count / total_requirements_count) * 100 : 0}%`,
              }}
            />
          </div>
        </button>

        {/* Card 3: Partial Matches */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick("Partial Match")}
          aria-label={`View ${partial_matches_count} partial matching requirements`}
          className="craft-card text-left rounded-xl p-5 shadow-xs border-slate-200 hover:border-amber-300 hover:shadow-sm transition flex flex-col justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Partial Matches
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform" aria-hidden="true">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700 tracking-tight font-mono tabular-nums">
                {partial_matches_count}
              </span>
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                / {total_requirements_count} required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Related skill present, but canonical depth needed.
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2" aria-hidden="true">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{
                width: `${total_requirements_count > 0 ? (partial_matches_count / total_requirements_count) * 100 : 0}%`,
              }}
            />
          </div>
        </button>

        {/* Card 4: Missing Skills */}
        <button
          type="button"
          onClick={() => onFilterClick && onFilterClick("Missing Skill")}
          aria-label={`View ${missing_skills_count} missing requirements`}
          className="craft-card text-left rounded-xl p-5 shadow-xs border-slate-200 hover:border-rose-300 hover:shadow-sm transition flex flex-col justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Missing Skills
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform" aria-hidden="true">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-700 tracking-tight font-mono tabular-nums">
                {missing_skills_count}
              </span>
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                / {total_requirements_count} required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unaddressed core competencies to target first.
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2" aria-hidden="true">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-700"
              style={{
                width: `${total_requirements_count > 0 ? (missing_skills_count / total_requirements_count) * 100 : 0}%`,
              }}
            />
          </div>
        </button>
      </div>

      {/* 2. Interactive "What-If" Upskilling Simulator Drawer */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-indigo-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                Interactive What-If Upskilling Simulator
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  Real-time Recalculation
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Toggle skills you plan to learn to watch your Gap Index decrease and Match Score rise in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {simulatorActive && simulationResults.newlyAcquiredCount > 0 && (
              <button
                type="button"
                onClick={handleResetSimulator}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 border border-indigo-700 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setSimulatorActive(!simulatorActive)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs ${
                simulatorActive
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {simulatorActive ? "Active Simulator (Live)" : "Activate Simulator"}
            </button>
          </div>
        </div>

        {/* Skill Simulation Checkbox Matrix */}
        {simulatorActive && (
          <div className="pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs text-indigo-200">
              <span>Select skills to simulate acquisition:</span>
              <span>
                Simulated Alignment:{" "}
                <strong className="text-emerald-400 font-mono text-sm">
                  {simulationResults.simulatedScore.toFixed(1)}%
                </strong>{" "}
                {simulationResults.scoreGain > 0 && (
                  <span className="text-emerald-300">
                    (+{simulationResults.scoreGain.toFixed(1)}% increase)
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {match_breakdown.map((item) => {
                const isSelected = !!simulatedSkills[item.skill_id];
                const isAlreadyStrong = item.status === "Strong Match";

                return (
                  <button
                    key={item.skill_id}
                    type="button"
                    disabled={isAlreadyStrong}
                    onClick={() => toggleSimulatedSkill(item.skill_id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                      isAlreadyStrong
                        ? "bg-slate-800/40 border-slate-700 text-slate-400 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-emerald-950/80 border-emerald-400/80 text-emerald-200 ring-1 ring-emerald-400/50"
                        : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200"
                    }`}
                  >
                    <span className="font-semibold truncate pr-2">
                      {item.skill_name}
                    </span>
                    {isAlreadyStrong ? (
                      <span className="text-[10px] text-emerald-400 shrink-0">
                        Acquired
                      </span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-indigo-300 font-mono shrink-0">
                        +{Math.round(item.weight * 100)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Multi-View Analytics Studio via Dynamically Loaded AnalyticsCharts */}
      <AnalyticsCharts
        roleProfileTitle={role_profile_title}
        radarData={radarData}
        spectrumData={spectrumData}
        pieData={pieData}
      />
    </div>
  );
}
