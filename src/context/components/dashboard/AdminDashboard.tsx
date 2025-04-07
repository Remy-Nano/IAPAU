import React, { useState } from "react";
import { AdminExaminersView } from "./AdminExaminersView";
import { AdminStudentsView } from "./AdminStudentsView";

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<"examiners" | "students">(
    "examiners"
  );

  return (
    <>
      {currentView === "examiners" ? (
        <AdminExaminersView
          onNavigateToStudents={() => setCurrentView("students")}
        />
      ) : (
        <AdminStudentsView
          onNavigateToExaminers={() => setCurrentView("examiners")}
        />
      )}
    </>
  );
};
