"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import React, { useState } from "react";

export const AuthDebug: React.FC = () => {
  const { user, userRole, isAuthenticated, logout } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  // Fonction pour effacer complètement le localStorage
  const clearStorage = () => {
    localStorage.clear();
    alert("LocalStorage effacé. La page va être rechargée.");
    window.location.reload();
  };

  // Fonction pour créer manuellement une session étudiant valide
  const createStudentSession = () => {
    const mockStudent = {
      id: "3",
      email: "student@example.com",
      role: "student",
      firstName: "Étudiant",
      lastName: "Test",
      studentId: "STU123",
      nom: "Test",
      prenom: "Étudiant",
      _id: "3",
      groupes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    localStorage.setItem("user", JSON.stringify(mockStudent));
    localStorage.setItem("userRole", "student");
    alert("Session étudiant créée. La page va être rechargée.");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
        title="Outils de débogage"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {showDebug && (
        <div className="mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 w-72">
          <h3 className="font-bold text-lg mb-2">Débogage Auth</h3>

          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <p>
              <span className="font-semibold">État:</span>{" "}
              {isAuthenticated ? "Connecté" : "Déconnecté"}
            </p>
            <p>
              <span className="font-semibold">Rôle:</span> {userRole || "Aucun"}
            </p>
            <p className="overflow-hidden text-ellipsis">
              <span className="font-semibold">User:</span>{" "}
              {user ? JSON.stringify(user).substring(0, 50) + "..." : "Aucun"}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={clearStorage}
              className="w-full bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600"
            >
              Effacer localStorage
            </button>

            <button
              onClick={createStudentSession}
              className="w-full bg-green-500 text-white py-1 px-2 rounded text-sm hover:bg-green-600"
            >
              Créer session étudiant
            </button>

            <Link
              href="/magic-link?token=test123"
              className="block w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600 text-center"
            >
              Simuler lien magique
            </Link>

            {isAuthenticated && (
              <button
                onClick={logout}
                className="w-full bg-purple-500 text-white py-1 px-2 rounded text-sm hover:bg-purple-600"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
