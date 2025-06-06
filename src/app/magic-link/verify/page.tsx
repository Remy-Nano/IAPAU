"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MagicLinkVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithMagicLink } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      console.log(
        "MagicLinkPage - Token:",
        token,
        "IsProcessing:",
        isProcessing
      );

      if (!token) {
        setError("Token manquant");
        setIsProcessing(false);
        return;
      }

      try {
        console.log("Tentative d'authentification avec token:", token);
        await loginWithMagicLink(token);
        console.log(
          "Authentification réussie, redirection vers /dashboard/student"
        );
        router.push("/dashboard/student");
      } catch (err) {
        console.error("Erreur d'authentification:", err);
        setError("Lien magique invalide ou expiré");
        setIsProcessing(false);
      }
    };

    verifyToken();
  }, [searchParams, loginWithMagicLink, router, isProcessing]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return null;
}
