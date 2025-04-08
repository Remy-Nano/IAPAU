import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { ExaminerDashboard } from "./ExaminerDashboard";
import { StudentDashboard } from "./StudentDashboard";

export const DashboardRouter: React.FC = () => {
  const { userRole } = useAuth();

  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!userRole) {
    return <Navigate to="/auth" replace />;
  }

  // Afficher la vue appropriée en fonction du rôle de l'utilisateur
  switch (userRole) {
    case "student":
      return <StudentDashboard />;
    case "examiner":
      return <ExaminerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};
