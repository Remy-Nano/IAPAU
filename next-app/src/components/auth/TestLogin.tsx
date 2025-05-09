import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TestLoginProps {
  role: "student" | "examiner" | "admin";
}

export const TestLogin: React.FC<TestLoginProps> = ({ role }) => {
  const { loginWithCredentials, loginWithMagicLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const login = async () => {
      try {
        if (role === "student") {
          await loginWithMagicLink("test-token");
        } else {
          await loginWithCredentials(
            `test-${role}@example.com`,
            role === "admin" ? "admin123" : "examiner123",
            role
          );
        }
        navigate("/");
      } catch (error) {
        console.error("Erreur de connexion de test:", error);
      }
    };

    login();
  }, [role, loginWithCredentials, loginWithMagicLink, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center">Connexion de test</h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Connexion en cours avec le rôle {role}...
          </p>
        </div>
      </div>
    </div>
  );
};
