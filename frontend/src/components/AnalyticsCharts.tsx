"use client";

import React, { useState } from "react";
import {
  Radar as RadarIcon,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
} from "recharts";

interface AnalyticsChartsProps {
  roleProfileTitle: string;
  radarData: Array<{ category: string; fullCategory: string; candidate: number; required: number }>;
  spectrumData: Array<{ name: string; fullName: string; score: number; status: string; matchType: string; weight: number }>;
  pieData: Array<{ name: string; value: number }>;
  onCategoryClick?: (category: string) => void;
}

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#ec4899"];

export default function AnalyticsCharts({
  roleProfileTitle,
  radarData,
  spectrumData,
  pieData,
  onCategoryClick,
}: AnalyticsChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState<"radar" | "spectrum" | "categories">("radar");

  const getBarColor = (status: string) => {
    if (status.includes("Strong")) return "#10b981";
    if (status.includes("Partial")) return "#f59e0b";
    return "#f43f5e";
  };

  return (
    <div className="craft-card rounded-xl p-6 sm:p-7 shadow-xs" role="region" aria-label="Role Competency Visual Analytics">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            Role Competency Visual Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-dimensional evaluation for target role: <strong className="text-slate-800">{roleProfileTitle}</strong>
          </p>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold" role="tablist" aria-label="Analytics visual chart modes">
          <button
            type="button"
            role="tab"
            aria-selected={activeChartTab === "radar"}
            onClick={() => setActiveChartTab("radar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
              activeChartTab === "radar"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <RadarIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Competency Radar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeChartTab === "spectrum"}
            onClick={() => setActiveChartTab("spectrum")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
              activeChartTab === "spectrum"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
            Proximity Spectrum
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeChartTab === "categories"}
            onClick={() => setActiveChartTab("categories")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
              activeChartTab === "categories"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Role Weights
          </button>
        </div>
      </div>

      {/* View 1: Competency Radar Chart */}
      {activeChartTab === "radar" && (
        <div className="h-80 w-full flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-white text-sm">{data.fullCategory}</p>
                        <p className="text-emerald-400">
                          Candidate Competency: <span className="font-bold">{data.candidate}%</span>
                        </p>
                        <p className="text-slate-400">
                          Target Requirement: <span className="font-bold">100%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Required Benchmark"
                dataKey="required"
                stroke="#cbd5e1"
                fill="#f1f5f9"
                fillOpacity={0.4}
              />
              <Radar
                name="Candidate Competency"
                dataKey="candidate"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.45}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
              Candidate Skill Level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
              Target Role Benchmark (100%)
            </span>
          </div>
        </div>
      )}

      {/* View 2: Horizontal Bar Proximity Spectrum */}
      {activeChartTab === "spectrum" && (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spectrumData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
                width={110}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-white text-sm">{data.fullName}</p>
                        <p className="text-slate-300">
                          Similarity Match: <span className="font-bold text-white">{data.score}%</span>
                        </p>
                        <p className="text-slate-300">
                          Status: <span className="font-bold text-white">{data.status}</span>
                        </p>
                        <p className="text-slate-300">
                          Mechanism: <span className="font-bold text-white">{data.matchType}</span>
                        </p>
                        <p className="text-slate-300">
                          Requirement Weight: <span className="font-bold text-white">{data.weight}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                {spectrumData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* View 3: Category Distribution Donut Chart */}
      {activeChartTab === "categories" && (
        <div className="h-80 w-full flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="h-full w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs">
                          <span className="font-bold">{data.name}:</span> {data.value}% of role weight
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category Weight Composition
              </h4>
              <span className="text-[10px] text-slate-400">Click to filter matrix</span>
            </div>
            {pieData.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onCategoryClick && onCategoryClick(cat.name)}
                className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-indigo-50/60 transition-colors border-b border-slate-100 text-left cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{cat.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-600 tabular-nums">{cat.value}%</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
