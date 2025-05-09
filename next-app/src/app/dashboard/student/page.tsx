import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export default function StudentDashboardPage() {
  const { userRole, isAuthenticated } = useAuth();

  if (!isAuthenticated || userRole !== "student") {
    redirect("/auth");
    return null;
  }

  return <StudentDashboard />;
}
