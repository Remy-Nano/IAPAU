"use client";

import { EditableUsersTable } from "@/components/admin/users/EditableUsersTable";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Gestion des utilisateurs
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <EditableUsersTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}
