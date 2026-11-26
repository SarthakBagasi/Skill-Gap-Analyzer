"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  Code2,
  Database,
  Brain,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [targetRoleId, setTargetRoleId] = useState("backend_developer");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleQuickLogin = async (u: string, p: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(u, p);
      setSuccessMessage("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push("/history");
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (activeTab === "login") {
        await login(username, password);
        setSuccessMessage("Signed in successfully! Redirecting...");
      } else {
        await register(username, password, fullName, email, targetRoleId);
        setSuccessMessage("Account created successfully! Redirecting...");
      }
      setTimeout(() => {
        router.push("/history");
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Candidate Account &amp; Audit Trail</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {user ? `Signed in as ${user.full_name}` : "Candidate Authentication"}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto [text-wrap:pretty]">
          Sign in to access your personal candidate audit trail. Every analysis run will be saved 
          privately under your personal history record.
        </p>
      </div>

      {/* If already signed in */}
      {user ? (
        <div className="craft-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 bg-white text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-xl font-black">
            {user.full_name.charAt(0)}
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{user.full_name}</h2>
            <p className="text-xs text-slate-500 font-mono">@{user.username} &bull; {user.email || "No email"}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/history"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>View Your Audit History</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <Link
              href="/analyzer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Start New Analysis
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 font-semibold text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="craft-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 bg-white">
          {/* Quick Demo Login Personas */}
          <div className="space-y-2.5 pb-5 border-b border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              1-Click Instant Demo Login:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("alex", "alex123")}
                disabled={isLoading}
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 group disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-0.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                  <span>Alex Johnson</span>
                </div>
                <span className="text-[10px] text-blue-700 block">Backend Developer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("priya", "priya123")}
                disabled={isLoading}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 group disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-0.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Priya Sharma</span>
                </div>
                <span className="text-[10px] text-emerald-700 block">Data Scientist</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("marcus", "marcus123")}
                disabled={isLoading}
                className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-600 group disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 mb-0.5">
                  <Brain className="w-3.5 h-3.5 text-purple-600 shrink-0" aria-hidden="true" />
                  <span>Marcus Vance</span>
                </div>
                <span className="text-[10px] text-purple-700 block">ML Engineer</span>
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              role="status"
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {activeTab === "register" && (
              <>
                <div>
                  <label htmlFor="reg-fullname" className="font-bold text-slate-800 block mb-1">
                    Candidate Full Name:
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="font-bold text-slate-800 block mb-1">
                    Email Address (Optional):
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="jordan.hayes@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-username" className="font-bold text-slate-800 block mb-1">
                Username:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="auth-username"
                  type="text"
                  required
                  placeholder="e.g. alex or jordan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="font-bold text-slate-800 block mb-1">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
                />
              </div>
            </div>

            {activeTab === "register" && (
              <div>
                <label htmlFor="reg-role" className="font-bold text-slate-800 block mb-1">
                  Target Career Role:
                </label>
                <select
                  id="reg-role"
                  value={targetRoleId}
                  onChange={(e) => setTargetRoleId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <option value="backend_developer">Backend Developer</option>
                  <option value="data_scientist">Data Scientist</option>
                  <option value="ml_engineer">Machine Learning Engineer</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === "login" ? "Sign In to Candidate Account" : "Register Account"}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
