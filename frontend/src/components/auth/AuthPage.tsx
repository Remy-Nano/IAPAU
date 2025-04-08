import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AuthManager } from "./AuthManager";

export const AuthPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthManager />
    </div>
  );
};
