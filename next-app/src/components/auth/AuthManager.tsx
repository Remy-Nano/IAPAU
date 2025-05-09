import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminAuth } from "./AdminAuth";
import { CredentialsInfo } from "./CredentialsInfo";
import { ExaminerAuth } from "./ExaminerAuth";
import { InitialAuth } from "./InitialAuth";
import { StudentAuth } from "./StudentAuth";
import { AuthService } from "@/services/authService";

export const AuthManager: React.FC = () => {
  const router = useRouter();
  const { loginWithEmail, loginWithCredentials, userRole } = useAuth();
  const [currentStep, setCurrentStep] = useState<
    "initial" | "student" | "examiner" | "admin"
  >("initial");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Gérer la redirection après connexion réussie
  useEffect(() => {
    // Si on a un userRole et qu'on n'est pas en erreur,
    // on redirige vers le dashboard approprié
    if (userRole && !error) {
      try {
        const redirectUrl = AuthService.getRedirectUrl(userRole);
        router.push(redirectUrl);
      } catch (err) {
        console.error('Erreur de redirection:', err);
      }
    }
  }, [userRole, error, router]);

  const handleInitialSubmit = async (email: string) => {
    try {
      setEmail(email);
      const userType = await loginWithEmail(email);

      if (!userType) {
        setError("Utilisateur non trouvé");
        return;
      }

      // Réinitialiser l'erreur avant de changer d'étape
      setError("");
      
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
      // Réinitialiser l'erreur après une tentative de connexion
      setError("");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      console.error(err);
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      await loginWithCredentials(email, password, "admin");
      // Réinitialiser l'erreur après une tentative de connexion
      setError("");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      {error && (
        <div className="fixed top-4 left-0 right-0 mx-auto max-w-md transform bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="text-sm">{error}</div>
            <button className="text-red-700 hover:text-red-800" onClick={() => setError("")}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-200">
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
