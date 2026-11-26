"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  History,
  Sliders,
  Cpu,
  Layers,
  HelpCircle,
  Menu,
  X,
  Home,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon?: any;
  responsiveClass?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Analyzer", href: "/analyzer", icon: FileText },
  { name: "Sandbox", href: "/sandbox", icon: Sliders, responsiveClass: "hidden sm:inline-flex" },
  { name: "Architecture", href: "/architecture", icon: Cpu, responsiveClass: "hidden md:inline-flex" },
  { name: "Compare", href: "/compare", icon: Layers, responsiveClass: "hidden lg:inline-flex" },
  { name: "History", href: "/history", icon: History },
  { name: "FAQ", href: "/faq", icon: HelpCircle, responsiveClass: "hidden sm:inline-flex" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const checkIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Desktop & Tablet Navigation */}
      <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = checkIsActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                item.responsiveClass || ""
              } ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100 font-medium border border-transparent"
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
                  }`}
                  aria-hidden="true"
                />
              )}
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="sm:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors ml-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          {isMobileMenuOpen ? (
            <X className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Menu className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile Drawer Menu (Visible when open on small screens) */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-xl z-40 p-4 space-y-1 animate-fadeIn">
          {NAV_ITEMS.map((item) => {
            const isActive = checkIsActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                    aria-hidden="true"
                  />
                )}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
