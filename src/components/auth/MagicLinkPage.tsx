import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const MagicLinkPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { loginWithMagicLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/auth");
      return;
    }

    const verifyToken = async () => {
      try {
        // En mode démonstration, on simule une connexion immédiate
        await loginWithMagicLink(token);
        navigate("/");
      } catch (error) {
        console.error("Erreur de vérification du token:", error);
        navigate("/auth");
      }
    };

    verifyToken();
  }, [searchParams, loginWithMagicLink, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Authentification en cours</h2>
        <p className="text-gray-600 mb-4">
          Nous vérifions votre lien magique, veuillez patienter...
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="mt-4 text-sm text-purple-600 hover:text-purple-800"
        >
          Retour à la page de connexion
        </button>
      </div>
    </div>
  );
};
