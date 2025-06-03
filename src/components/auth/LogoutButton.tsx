"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter(); //

  const handleLogout = () => {
    logout();
    router.push("/login"); // ✅ redirection vers la page de login
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      <LogOut className="h-4 w-4 mr-2" />
      <span>Déconnexion</span>
    </button>
  );
};
