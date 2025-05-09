import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { DashboardRouter } from "@/components/dashboard/DashboardRouter";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    redirect("/auth");
    return null;
  }

  return <DashboardRouter />;
}
