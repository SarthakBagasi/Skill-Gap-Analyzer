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
import { useAuth } from "@/context/AuthContext";
import GapSummaryCards from "@/components/GapSummaryCards";
import EvidenceTable from "@/components/EvidenceTable";
import LearningRoadmap from "@/components/LearningRoadmap";

const rawApiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = rawApiBase.replace(/\/+$/, "").replace(/\/api$/, "");

export default function HistoryPage() {
  const { user, token, logout } = useAuth();
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = user?.id ? `${API_BASE}/api/history?user_id=${user.id}` : `${API_BASE}/api/history`;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(url, { headers });
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
  }, [user?.id, token]);

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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden rounded-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Back to Analyzer Workspace
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-600 shrink-0" aria-hidden="true" />
            {user ? `${user.full_name}'s Audit Records` : "Candidate Assessment Audit Records"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 [text-wrap:pretty]">
            {user
              ? `Personalized candidate evaluation history for ${user.email} (${user.role.toUpperCase()}).`
              : "Traceable audit trails and historical skill gap evaluations persisted for career decision support."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <label htmlFor="history-search-input" className="sr-only">
              Filter audit records
            </label>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="history-search-input"
              type="search"
              placeholder="Filter audit records…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 shadow-xs w-48 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            aria-label="Refresh audit records list"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Auth Status & Account Isolation Banner */}
      {user ? (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-xs">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{user.full_name}</span>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  Candidate ID: {user.id}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Target Role: <strong className="text-slate-700">{user.target_role_id || "General"}</strong> &bull; Only audits conducted under this account are displayed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs transition-colors shadow-2xs"
            >
              Switch Account
            </Link>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-bold text-xs transition-colors shadow-2xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
              !
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Shared Public Demo History</span>
              <p className="text-slate-600 text-xs mt-0.5">
                You are currently viewing shared public evaluation records. Sign in to maintain an isolated, private audit trail for your candidate resume.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
          >
            Sign In / Switch Candidate &rarr;
          </Link>
        </div>
      )}

      {/* Quick Summary Stats Bar */}
      {!isLoading && !error && historyItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="craft-card rounded-xl p-4 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {user ? "Personal Audits" : "Total Audits Persisted"}
            </span>
            <span className="text-xl font-mono font-black text-slate-900 tabular-nums">
              {historyItems.length}
            </span>
          </div>
          <div className="craft-card rounded-xl p-4 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Average Match Score
            </span>
            <span className="text-xl font-mono font-black text-indigo-600 tabular-nums">
              {(historyItems.reduce((acc, i) => acc + i.overall_match_score, 0) / historyItems.length).toFixed(1)}%
            </span>
          </div>
          <div className="craft-card rounded-xl p-4 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Average Gap Index (G)
            </span>
            <span className="text-xl font-mono font-black text-slate-900 tabular-nums">
              {(historyItems.reduce((acc, i) => acc + i.gap_index, 0) / historyItems.length).toFixed(3)}
            </span>
          </div>
          <div className="craft-card rounded-xl p-4 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Persistence Engine
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 mt-1 block">
              SQLAlchemy / DB
            </span>
          </div>
        </div>
      )}

      {/* History Items Grid */}
      {isLoading ? (
        <div className="py-20 text-center" role="status" aria-live="polite">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" aria-hidden="true" />
          <p className="text-xs text-slate-500 font-medium">Loading historical candidate assessments…</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-xs text-rose-800 flex items-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="craft-card rounded-2xl p-12 text-center border-slate-200 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {user ? `No Assessment Records for ${user.full_name}` : "No Assessment Records Found"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 [text-wrap:pretty]">
            {user
              ? "You haven't run any evaluations yet under this account. Ingest your resume in the Analyzer to record your private audit trail."
              : "Run an analysis from the workspace to log explainable candidate evaluations into PostgreSQL/SQLite."}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden"
            >
              Launch Analyzer Workspace
            </Link>
            {!user && (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl shadow-2xs transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistory.map((item) => {
            const isSelected = selectedAnalysis?.id === item.id;

            return (
              <div
                key={item.id}
                className={`craft-card rounded-xl p-6 shadow-xs transition-colors flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="font-mono tabular-nums">{item.created_at}</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
                      {item.source_type.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                    {item.candidate_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    {item.role_profile_title}
                  </p>
                </div>

                {/* Score & Gap Index Summary */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Gap Index (G):</span>
                    <span className="font-mono font-extrabold text-slate-900 tabular-nums">
                      {item.gap_index.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Alignment Score:</span>
                    <span className="font-mono font-black text-indigo-600 text-sm tabular-nums">
                      {item.overall_match_score.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] font-bold">
                    <span className="text-emerald-700">✓ <span className="tabular-nums font-mono">{item.strong_matches_count}</span> Strong</span>
                    <span className="text-amber-700">~ <span className="tabular-nums font-mono">{item.partial_matches_count}</span> Partial</span>
                    <span className="text-rose-700">✗ <span className="tabular-nums font-mono">{item.missing_skills_count}</span> Missing</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleViewDetail(item.id)}
                    disabled={isDetailLoading}
                    aria-label={`Inspect full audit report for ${item.candidate_name}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden rounded-md py-1 px-1.5"
                  >
                    Inspect Full Audit
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete audit record for ${item.candidate_name}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 focus:outline-hidden"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Historical Analysis Breakdown Drawer */}
      {selectedAnalysis && (
        <section id="detail-view" aria-labelledby="detail-view-title" className="space-y-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between craft-card bg-indigo-50/50 border-indigo-200 rounded-2xl p-6 gap-4">
            <div>
              <h2 id="detail-view-title" className="text-lg sm:text-xl font-black text-slate-900">
                {selectedAnalysis.candidate_name} &bull; {selectedAnalysis.role_profile_title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamp: <span className="font-mono tabular-nums">{selectedAnalysis.created_at}</span> &bull; Run ID:{" "}
                <span className="font-mono">{selectedAnalysis.id}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAnalysis(null)}
              aria-label="Close detailed audit view"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus:outline-hidden"
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
