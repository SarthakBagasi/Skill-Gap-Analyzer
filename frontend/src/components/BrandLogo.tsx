"use client";

import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function BrandLogo({
  className = "",
  size = "md",
  showText = false,
}: BrandLogoProps) {
  // Dimension mapping
  const sizeMap = {
    sm: { box: 32, icon: 32, fontTitle: "text-sm", fontSub: "text-[10px]" },
    md: { box: 44, icon: 44, fontTitle: "text-base", fontSub: "text-[11px]" },
    lg: { box: 54, icon: 54, fontTitle: "text-lg", fontSub: "text-xs" },
    xl: { box: 64, icon: 64, fontTitle: "text-xl", fontSub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Custom Vector Mark: Dual-Vector Convergence Nexus */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{ width: currentSize.box, height: currentSize.box }}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Candidate Competency Gradient (Electric Indigo to Violet) */}
            <linearGradient id="nexusGradPrimary" x1="6" y1="36" x2="26" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            {/* Target Role Benchmark Gradient (Cyan to Emerald) */}
            <linearGradient id="nexusGradSecondary" x1="38" y1="36" x2="18" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Core Gap Aperture Pulse Gradient */}
            <linearGradient id="nexusGradCore" x1="16" y1="16" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Light Luminous Squircle Canvas Gradient */}
            <linearGradient id="nexusLightBg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#eef2ff" />
            </linearGradient>

            {/* Subtle Tech Border Gradient */}
            <linearGradient id="nexusBorderGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c7d2fe" />
              <stop offset="50%" stopColor="#ddd6fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>

            {/* Ambient Soft Drop Shadow */}
            <filter id="nexusShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4f46e5" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Luminous Light Squircle Canvas Container */}
          <rect
            width="44"
            height="44"
            rx="13"
            fill="url(#nexusLightBg)"
          />
          <rect
            x="0.75"
            y="0.75"
            width="42.5"
            height="42.5"
            rx="12.25"
            stroke="url(#nexusBorderGrad)"
            strokeWidth="1.5"
          />

          {/* Subtle architectural calibration grid */}
          <path
            d="M22 6V38M6 22H38"
            stroke="#e2e8f0"
            strokeWidth="0.75"
            strokeDasharray="2 3"
          />

          {/* Vector Track A: Candidate Skill Curve (Rising from Left, entering gap apex) */}
          <path
            d="M10 32C11.5 24 16 14 22 10C24.5 13.5 26 18 26 21"
            stroke="url(#nexusGradPrimary)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#nexusShadow)"
          />

          {/* Vector Track B: Target Role Curve (Descending from Right, interlocking across gap) */}
          <path
            d="M34 32C32.5 24 28 14 22 10C19.5 13.5 18 18 18 21"
            stroke="url(#nexusGradSecondary)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gap Closure Bridge: Horizontal Alignment Baseline */}
          <path
            d="M14 27.5L22 22L30 27.5"
            stroke="url(#nexusGradCore)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.95"
          />

          {/* Central Convergence Focal Point (Dynamic Vector Core) */}
          <circle
            cx="22"
            cy="10"
            r="3.5"
            fill="#ffffff"
            stroke="#4f46e5"
            strokeWidth="2"
          />
          <circle
            cx="22"
            cy="10"
            r="1.2"
            fill="#4f46e5"
          />

          {/* Gap Anchor Node Left */}
          <circle
            cx="14"
            cy="27.5"
            r="1.8"
            fill="#6366f1"
          />

          {/* Gap Anchor Node Right */}
          <circle
            cx="30"
            cy="27.5"
            r="1.8"
            fill="#06b6d4"
          />
        </svg>
      </div>

      {/* Optional Integrated Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`font-black text-slate-900 tracking-tight leading-none ${currentSize.fontTitle}`}>
              Skill Gap Analyzer
            </span>
            <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full leading-none">
              v1.0
            </span>
          </div>
          <span className={`text-slate-500 font-medium tracking-tight mt-1 leading-none ${currentSize.fontSub}`}>
            Career Skill Assessment & Recommendation System
          </span>
        </div>
      )}
    </div>
  );
}
