"use client";

import React, { useState, useMemo } from "react";
import {
  FileCheck2,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Filter,
  ArrowUpDown,
  Check,
  Cpu,
} from "lucide-react";
import { MatchBreakdownItem, MatchStatus } from "@/types/analysis";

interface EvidenceTableProps {
  items: MatchBreakdownItem[];
}

export default function EvidenceTable({ items }: EvidenceTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"weight" | "similarity" | "name">("weight");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Extract unique categories for category filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [items]);

  const toggleRow = (skillId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  const handleCopyMarkdown = () => {
    let md = "| Role Requirement | Category | Weight | Match Status | Mechanism | Similarity | Matched Evidence | Rationale |\n";
    md += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";
    filteredAndSortedItems.forEach((item) => {
      md += `| ${item.skill_name} | ${item.category} | ${Math.round(item.weight * 100)}% | ${item.status} | ${item.match_type} | ${(item.similarity_score * 100).toFixed(0)}% | ${item.matched_candidate_skill || "N/A"} | ${item.explanation} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleDownloadCSV = () => {
    let csv = "Requirement,Category,Weight,Status,Mechanism,Similarity,MatchedEvidence,Explanation\n";
    filteredAndSortedItems.forEach((i) => {
      const escape = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
      csv += `${escape(i.skill_name)},${escape(i.category)},${i.weight},${escape(i.status)},${escape(i.match_type)},${i.similarity_score},${escape(i.matched_candidate_skill || "")},${escape(i.explanation)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `skill_gap_evidence_matrix.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedItems = useMemo(() => {
    let list = items.filter((item) => {
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.skill_name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.matched_candidate_skill && item.matched_candidate_skill.toLowerCase().includes(q)) ||
        item.explanation.toLowerCase().includes(q);

      return matchesStatus && matchesCategory && matchesSearch;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === "weight") {
        comp = a.weight - b.weight;
      } else if (sortBy === "similarity") {
        comp = a.similarity_score - b.similarity_score;
      } else {
        comp = a.skill_name.localeCompare(b.skill_name);
      }
      return sortOrder === "desc" ? -comp : comp;
    });

    return list;
  }, [items, filterStatus, filterCategory, searchQuery, sortBy, sortOrder]);

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case "Strong Match":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Strong Match
          </span>
        );
      case "Partial Match":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Partial Match
          </span>
        );
      case "Missing Skill":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Missing Skill
          </span>
        );
    }
  };

  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case "Exact Keyword Match":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
            <Hash className="w-3 h-3" />
            Exact Keyword
          </span>
        );
      case "Semantic Vector Match":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3 h-3" />
            S-BERT Vector
          </span>
        );
      case "None":
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 text-slate-500">
            None
          </span>
        );
    }
  };

  const counts = {
    all: items.length,
    strong: items.filter((i) => i.status === "Strong Match").length,
    partial: items.filter((i) => i.status === "Partial Match").length,
    missing: items.filter((i) => i.status === "Missing Skill").length,
  };

  return (
    <div className="craft-card rounded-xl shadow-xs overflow-hidden">
      {/* Header section with Search, Category Filter, and Export Tools */}
      <div className="p-6 sm:p-7 border-b border-slate-200/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              Requirement-Level Semantic Proximity Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent, deterministic audit trail showing exact phrase matches vs Sentence-BERT cosine similarity
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              aria-label="Copy evidence matrix as Markdown table"
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-1.5"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              aria-label="Download evidence matrix as CSV spreadsheet"
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search, Filter Pills & Sorter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium" role="tablist" aria-label="Status filter">
            <button
              role="tab"
              aria-selected={filterStatus === "all"}
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                filterStatus === "all"
                  ? "bg-white text-slate-900 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              role="tab"
              aria-selected={filterStatus === "Strong Match"}
              onClick={() => setFilterStatus("Strong Match")}
              className={`px-3 py-1.5 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                filterStatus === "Strong Match"
                  ? "bg-white text-emerald-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Strong ({counts.strong})
            </button>
            <button
              role="tab"
              aria-selected={filterStatus === "Partial Match"}
              onClick={() => setFilterStatus("Partial Match")}
              className={`px-3 py-1.5 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 ${
                filterStatus === "Partial Match"
                  ? "bg-white text-amber-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Partial ({counts.partial})
            </button>
            <button
              role="tab"
              aria-selected={filterStatus === "Missing Skill"}
              onClick={() => setFilterStatus("Missing Skill")}
              className={`px-3 py-1.5 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 ${
                filterStatus === "Missing Skill"
                  ? "bg-white text-rose-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Missing ({counts.missing})
            </button>
          </div>

          {/* Right: Category Selector & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category filter dropdown */}
            <select
              aria-label="Filter by skill category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 shadow-xs"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sorter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 shadow-xs">
              <span className="text-slate-400 mr-1 text-[11px]">Sort:</span>
              <button
                type="button"
                aria-label={`Sort by requirement weight, currently ${sortOrder}`}
                onClick={() => {
                  if (sortBy === "weight") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortBy("weight");
                    setSortOrder("desc");
                  }
                }}
                className={`px-2 py-0.5 rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  sortBy === "weight" ? "text-indigo-600 font-bold bg-indigo-50" : "text-slate-600"
                }`}
              >
                Weight {sortBy === "weight" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
              <button
                type="button"
                aria-label={`Sort by match score, currently ${sortOrder}`}
                onClick={() => {
                  if (sortBy === "similarity") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortBy("similarity");
                    setSortOrder("desc");
                  }
                }}
                className={`px-2 py-0.5 rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  sortBy === "similarity" ? "text-indigo-600 font-bold bg-indigo-50" : "text-slate-600"
                }`}
              >
                Score {sortBy === "similarity" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                aria-label="Filter competencies by search query"
                placeholder="Filter by keyword…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 shadow-xs w-44 sm:w-52"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse" aria-label="Requirement-Level Explainability Matrix">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-3.5 px-5">Target Requirement</th>
              <th scope="col" className="py-3.5 px-3">Role Weight</th>
              <th scope="col" className="py-3.5 px-3">Match Status</th>
              <th scope="col" className="py-3.5 px-3">Mechanism</th>
              <th scope="col" className="py-3.5 px-3">Similarity</th>
              <th scope="col" className="py-3.5 px-3">Candidate Proximity</th>
              <th scope="col" className="py-3.5 px-4 text-right">Deep Dive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No competencies matched the current filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((item, idx) => {
                const isExpanded = !!expandedRows[item.skill_id];

                return (
                  <React.Fragment key={item.skill_id || idx}>
                    <tr
                      onClick={() => toggleRow(item.skill_id)}
                      className={`hover:bg-indigo-50/40 transition-colors cursor-pointer group ${
                        isExpanded ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      {/* Skill Name & Category */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                            {item.skill_name}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Weight & Importance */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-xs tabular-nums">
                          {Math.round(item.weight * 100)}%
                        </span>
                        <span
                          className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.importance === "Must Have"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.importance}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Mechanism */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getMatchTypeBadge(item.match_type)}
                      </td>

                      {/* Similarity */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 text-xs tabular-nums">
                            {(item.similarity_score * 100).toFixed(0)}%
                          </span>
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden" aria-hidden="true">
                            <div
                              className={`h-full rounded-full ${
                                item.similarity_score >= 0.65
                                  ? "bg-emerald-500"
                                  : item.similarity_score >= 0.45
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{
                                width: `${Math.round(item.similarity_score * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Candidate Proximity */}
                      <td className="py-4 px-3">
                        {item.matched_candidate_skill ? (
                          <span className="font-medium text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[11px] inline-block shadow-2xs">
                            {item.matched_candidate_skill}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Not detected
                          </span>
                        )}
                      </td>

                      {/* Deep-dive Toggle Icon */}
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`detail-${item.skill_id}`}
                          aria-label={`${isExpanded ? "Collapse" : "Expand"} deep dive explanation for ${item.skill_name}`}
                          className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Explainability Drawer */}
                    {isExpanded && (
                      <tr id={`detail-${item.skill_id}`} className="bg-slate-50/90 border-y border-indigo-100">
                        <td colSpan={7} className="p-5">
                          <div className="glass-panel rounded-2xl p-4 sm:p-5 border-indigo-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                Explainability Deep Dive: {item.skill_name}
                              </span>
                              <span className="font-mono text-slate-500 text-[11px]">
                                Weight Contribution: w_j × s_j = ({(item.weight).toFixed(2)} × {item.similarity_score.toFixed(2)}) = +{(item.weight * item.similarity_score * 100).toFixed(1)}% to overall alignment
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  Deterministic Evaluation Rationale
                                </span>
                                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                                  {item.explanation}
                                </p>
                              </div>

                              <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  Candidate Evidence Snippet
                                </span>
                                <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed">
                                  {item.evidence_snippet ? (
                                    <span>&ldquo;{item.evidence_snippet}&rdquo;</span>
                                  ) : (
                                    <span className="text-slate-400 italic">
                                      Zero explicit phrase or high-proximity embedding identified in submitted resume text.
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
