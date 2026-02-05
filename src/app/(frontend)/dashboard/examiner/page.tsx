import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ExaminerDashboard from "@/components/examiner/ExaminerDashboard";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["examiner"]}>
      <ExaminerDashboard />
    </ProtectedRoute>
  );
}
