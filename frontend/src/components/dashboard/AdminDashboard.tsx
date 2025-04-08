import { Brain, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";
import { AdminExaminersView } from "./AdminExaminersView";
import { AdminStudentsView } from "./AdminStudentsView";

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<"students" | "examiners">(
    "students"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex w-full md:w-64 bg-gray-900 text-white p-4 flex-col absolute md:relative inset-0 z-40`}
      >
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold">AI studio</h1>
        </div>

        <div className="mt-8 space-y-2">
          <div
            onClick={() => {
              setCurrentView("students");
              setSidebarOpen(false); // Ferme le menu sur mobile
            }}
            className={`p-3 rounded-lg cursor-pointer ${
              currentView === "students"
                ? "bg-indigo-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Gestion des étudiants</span>
          </div>
          <div
            onClick={() => {
              setCurrentView("examiners");
              setSidebarOpen(false); // Ferme le menu sur mobile
            }}
            className={`p-3 rounded-lg cursor-pointer ${
              currentView === "examiners"
                ? "bg-indigo-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Gestion des examinateurs</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {currentView === "students"
              ? "Gestion des étudiants"
              : "Gestion des examinateurs"}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg">
              Administrateur
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Current View */}
        <div className="flex-1 overflow-auto">
          {currentView === "students" ? (
            <AdminStudentsView />
          ) : (
            <AdminExaminersView />
          )}
        </div>
      </div>
    </div>
  );
};
