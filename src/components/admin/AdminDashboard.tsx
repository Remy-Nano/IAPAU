"use client";

import { EditableUsersTable } from "@/components/admin/users/EditableUsersTable";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { HackathonManager } from "@/components/HackathonManager";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Code,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<"users" | "hackathons">(
    "users"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F6FA_100%)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_70%_10%,rgba(56,189,248,0.08),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden absolute top-4 left-4 z-50 p-2.5 rounded-lg bg-[#0F172A] text-white shadow-[0_10px_30px_-12px_rgba(2,6,23,0.6)] border border-slate-800/60"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <button
        type="button"
        onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-50 items-center gap-2 rounded-r-2xl border border-[#D7E3F2]/80 bg-white/80 px-2.5 py-3 shadow-[0_10px_26px_-18px_rgba(15,23,42,0.25)] text-[#0F172A]/80 backdrop-blur-md transition-all duration-300 ease-in-out hover:-translate-y-[52%] hover:shadow-[0_12px_30px_-18px_rgba(56,189,248,0.35)] ${
          isSidebarCollapsed ? "left-0" : "md:left-72 lg:left-80"
        }`}
        aria-label={isSidebarCollapsed ? "Ouvrir la sidebar" : "Fermer la sidebar"}
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[0.2em] text-[#0F172A]/60">
          Menu
        </span>
        <span className="h-5 w-5 rounded-full border border-cyan-400/40 bg-cyan-400/15 flex items-center justify-center text-cyan-600">
          {isSidebarCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex w-full ${
          isSidebarCollapsed ? "md:w-0 md:opacity-0 md:pointer-events-none" : "md:w-72 lg:w-80"
        } bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.12),transparent_60%),linear-gradient(180deg,#F8FAFC_0%,#F1F6FB_100%)] text-[#0F172A] p-4 flex-col absolute md:relative inset-0 z-40 border-r border-[#D7E3F2]/80 rounded-r-2xl shadow-[0_12px_30px_-20px_rgba(15,23,42,0.12)] transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center space-x-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 border border-[#E2E8F0]/80 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.16)]">
            <Brain className="h-5 w-5 text-cyan-500" />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h1 className="text-lg font-semibold tracking-wide text-[#0F172A]">
                IAPAU Admin
              </h1>
              <p className="text-xs text-[#0F172A]/55">Console de gestion</p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <div
            onClick={() => {
              setCurrentView("users");
              setSidebarOpen(false);
            }}
            className={`p-3 rounded-2xl cursor-pointer transition-colors border ${
              currentView === "users"
                ? "bg-cyan-500/10 border-cyan-400/40"
                : "bg-white/80 border-[#D7E3F2]/80 hover:border-cyan-400/30"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users size={18} className="text-cyan-500" />
              {!isSidebarCollapsed && (
                <span className="font-medium text-[#0F172A]">
                  Gestion des utilisateurs
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => {
              setCurrentView("hackathons");
              setSidebarOpen(false);
            }}
            className={`p-3 rounded-2xl cursor-pointer transition-colors border ${
              currentView === "hackathons"
                ? "bg-cyan-500/10 border-cyan-400/40"
                : "bg-white/80 border-[#D7E3F2]/80 hover:border-cyan-400/30"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Code size={18} className="text-cyan-500" />
              {!isSidebarCollapsed && (
                <span className="font-medium text-[#0F172A]">
                  Gestion des Hackathons
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="relative bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400/80 via-slate-600/60 to-slate-900/60" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-[#0F172A]/90 uppercase tracking-[0.12em]">
                {currentView === "users"
                  ? "Gestion des utilisateurs"
                  : "Gestion des Hackathons"}
              </h1>
              <p className="text-[11px] text-slate-500">
                Administration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-white/90 text-slate-700 rounded-full border border-slate-200 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.2)] text-xs font-medium">
                Administrateur
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Current View */}
        <div className="relative flex-1 overflow-auto p-4 md:p-6">
          <div className="relative mx-auto w-full max-w-[1200px]">
            {currentView === "users" ? (
              <div className="bg-white/90 rounded-2xl shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)] border border-slate-200/70 p-6">
                <EditableUsersTable />
              </div>
            ) : (
              <HackathonManager />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
