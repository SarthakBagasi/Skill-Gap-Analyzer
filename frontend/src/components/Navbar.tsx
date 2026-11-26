"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
  User as UserIcon,
  LogIn,
  LogOut,
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
  const { user, logout } = useAuth();
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

        {/* User Account Status Indicator */}
        <div className="pl-1 sm:pl-2 sm:border-l sm:border-slate-200 flex items-center">
          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-colors"
                title={`Signed in as ${user.full_name} (@${user.username})`}
              >
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                  {user.full_name.charAt(0)}
                </span>
                <span className="hidden md:inline max-w-[90px] truncate">{user.full_name.split(" ")[0]}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

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

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-800">{user.full_name}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold bg-indigo-600 text-white rounded-xl block"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
