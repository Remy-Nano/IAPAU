import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { ExaminerDashboard } from "./ExaminerDashboard";
import { StudentDashboard } from "./StudentDashboard";

export const DashboardRouter: React.FC = () => {
  const { userRole } = useAuth();

  // Rediriger vers la page d'authentification si le rôle n'est pas défini
  if (!userRole) {
    redirect("/auth");
    return null;
  }

  // Afficher le dashboard approprié en fonction du rôle
  switch (userRole) {
    case "student":
      return <StudentDashboard />;
    case "examiner":
      return <ExaminerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      redirect("/auth");
      return null;
  }
};
