"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { AnalysisHistoryItem, AnalysisResponse } from "@/types/analysis";
import GapSummaryCards from "@/components/GapSummaryCards";
import EvidenceTable from "@/components/EvidenceTable";
import LearningRoadmap from "@/components/LearningRoadmap";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      if (!res.ok) throw new Error("Failed to fetch analysis audit history");
      const data = await res.json();
      setHistoryItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load audit history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetail = async (runId: string) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/history/${runId}`);
      if (!res.ok) throw new Error("Failed to fetch analysis details");
      const data: AnalysisResponse = await res.json();
      setSelectedAnalysis(data);

      setTimeout(() => {
        document.getElementById("detail-view")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err: any) {
      alert("Error loading run detail: " + err.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (runId: string) => {
    if (!confirm("Are you sure you want to delete this historical analysis record?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/history/${runId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHistoryItems((prev) => prev.filter((item) => item.id !== runId));
        if (selectedAnalysis && selectedAnalysis.id === runId) {
          setSelectedAnalysis(null);
        }
      }
    } catch (err: any) {
      alert("Error deleting record: " + err.message);
    }
  };

  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return historyItems.filter((i) => {
      return (
        i.candidate_name.toLowerCase().includes(q) ||
        i.role_profile_title.toLowerCase().includes(q) ||
        i.source_type.toLowerCase().includes(q)
      );
    });
  }, [historyItems, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Analyzer Workspace
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-600" />
            Candidate Assessment Audit Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit trails and historical skill gap evaluations persisted for career decision support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter audit records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs w-48 sm:w-56"
            />
          </div>

          <button
            onClick={fetchHistory}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* History Items Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading historical candidate assessments...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-xs text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center shadow-xs border-slate-200 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Assessment Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Run an analysis from the workspace to log explainable candidate evaluations into PostgreSQL/SQLite.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs transition"
          >
            Launch Analyzer Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistory.map((item) => {
            const isSelected = selectedAnalysis?.id === item.id;

            return (
              <div
                key={item.id}
                className={`glass-panel rounded-3xl p-6 shadow-xs transition-all flex flex-col justify-between space-y-4 border ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 translate-y-[-2px] bg-white"
                    : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.created_at}
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
                      {item.source_type.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600 shrink-0" />
                    {item.candidate_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {item.role_profile_title}
                  </p>
                </div>

                {/* Score & Gap Index Summary */}
                <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Gap Index (G):</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {item.gap_index.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Alignment Score:</span>
                    <span className="font-mono font-black text-indigo-600 text-sm">
                      {item.overall_match_score.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] font-bold">
                    <span className="text-emerald-700">✓ {item.strong_matches_count} Strong</span>
                    <span className="text-amber-700">~ {item.partial_matches_count} Partial</span>
                    <span className="text-rose-700">✗ {item.missing_skills_count} Missing</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleViewDetail(item.id)}
                    disabled={isDetailLoading}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                  >
                    Inspect Full Audit
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Historical Analysis Breakdown Drawer */}
      {selectedAnalysis && (
        <section id="detail-view" className="space-y-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between glass-panel bg-indigo-50/70 border border-indigo-200 rounded-3xl p-6 gap-4">
            <div>
              <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
                Audited Assessment Detail View
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {selectedAnalysis.candidate_name} &bull; {selectedAnalysis.role_profile_title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamp: {selectedAnalysis.created_at} &bull; Run ID:{" "}
                <span className="font-mono">{selectedAnalysis.id}</span>
              </p>
            </div>
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto"
            >
              Close Detailed Audit
            </button>
          </div>

          <GapSummaryCards analysis={selectedAnalysis} />
          <EvidenceTable items={selectedAnalysis.match_breakdown} />
          <LearningRoadmap roadmap={selectedAnalysis.recommendations} />
        </section>
      )}
    </div>
  );
}
