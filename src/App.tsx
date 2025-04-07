import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { AuthPage } from "./components/auth/AuthPage";
import { MagicLinkPage } from "./components/auth/MagicLinkPage";
import { TestLogin } from "./components/auth/TestLogin";
import { DashboardRouter } from "./components/dashboard/DashboardRouter";
import { useAuth } from "./context/AuthContext";

// Composant protégé qui nécessite une authentification
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Application principale avec les routes
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/magic-link" element={<MagicLinkPage />} />

        {/* Routes de test pour faciliter l'accès aux différentes vues */}
        <Route
          path="/test-login/student"
          element={<TestLogin role="student" />}
        />
        <Route
          path="/test-login/examiner"
          element={<TestLogin role="examiner" />}
        />
        <Route path="/test-login/admin" element={<TestLogin role="admin" />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
