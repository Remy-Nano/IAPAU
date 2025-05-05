import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import StudentDashboard from "@/components/student/StudentDashboard";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}
