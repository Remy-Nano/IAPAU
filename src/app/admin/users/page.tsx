"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EditableUsersTable } from "./components/EditableUsersTable";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Gestion des utilisateurs
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <EditableUsersTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}
