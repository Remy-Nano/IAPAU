import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const MagicLinkPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { loginWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Lien de connexion invalide ou expiré");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        await loginWithMagicLink(token);
        navigate("/");
      } catch (err) {
        console.error("Erreur de vérification du token:", err);
        setError("Lien de connexion invalide ou expiré");
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, loginWithMagicLink, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center">Connexion étudiant</h2>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Vérification de votre lien de connexion...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Retour à la page de connexion
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
