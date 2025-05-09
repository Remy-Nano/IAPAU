'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { AuthManager } from "./AuthManager";

export const AuthPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthManager />
    </div>
  );
};
