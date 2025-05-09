// src/app/users/page.tsx
"use client";

import { EditableUsersTable } from "../components/EditableUsersTable";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="header">
        <h1>Gestion des utilisateurs</h1>
      </div>
      <div className="card">
        <EditableUsersTable />
      </div>
    </div>
  );
}
