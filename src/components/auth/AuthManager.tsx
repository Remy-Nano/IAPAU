import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAuth } from "./AdminAuth";
import { CredentialsInfo } from "./CredentialsInfo";
import { ExaminerAuth } from "./ExaminerAuth";
import { InitialAuth } from "./InitialAuth";
import { StudentAuth } from "./StudentAuth";

export const AuthManager: React.FC = () => {
  const { loginWithEmail, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<
    "initial" | "student" | "examiner" | "admin"
  >("initial");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleInitialSubmit = async (email: string) => {
    try {
      setEmail(email);
      const userType = await loginWithEmail(email);

      if (!userType) {
        setError("Utilisateur non trouvé");
        return;
      }

      switch (userType) {
        case "student":
          // Simuler l'envoi d'un email avec un lien magique
          console.log(`Envoi d'un lien magique à ${email}`);
          setCurrentStep("student");
          break;
        case "examiner":
          setCurrentStep("examiner");
          break;
        case "admin":
          setCurrentStep("admin");
          break;
      }
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
    }
  };

  const handleExaminerLogin = async (email: string, password: string) => {
    try {
      await loginWithCredentials(email, password, "examiner");
      navigate("/");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      console.error(err);
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      await loginWithCredentials(email, password, "admin");
      navigate("/");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      {error && (
        <div className="fixed top-4 left-0 right-0 mx-auto max-w-xs sm:max-w-sm md:max-w-md transform bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          {error}
          <button className="ml-2 font-bold" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-md">
        {currentStep === "initial" && (
          <InitialAuth onSubmit={handleInitialSubmit} />
        )}

        {currentStep === "student" && <StudentAuth email={email} />}

        {currentStep === "examiner" && (
          <ExaminerAuth onSubmit={handleExaminerLogin} />
        )}

        {currentStep === "admin" && <AdminAuth onSubmit={handleAdminLogin} />}

        <CredentialsInfo />
      </div>
    </div>
  );
};
