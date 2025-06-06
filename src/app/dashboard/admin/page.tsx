// /dashboard/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "administrateur") {
    redirect("/login");
  }

  return <AdminDashboard />;
}
