"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MAGIC_LINK_SUCCESS_REDIRECT,
  verifyMagicLinkAndRedirect,
} from "@/lib/client/magic-link";

function MagicLinkVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithMagicLink } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (!error) {
      setShowError(false);
      return;
    }
    const timeoutId = setTimeout(() => setShowError(true), 300);
    return () => clearTimeout(timeoutId);
  }, [error]);

  useEffect(() => {
    const verifyToken = async () => {
      if (hasVerifiedRef.current) return;
      hasVerifiedRef.current = true;

      const token = searchParams.get("token");
      console.log(
        "MagicLinkVerifyPage - Token:",
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
        setError("");
        console.log("Tentative d'authentification avec token:", token);
        await verifyMagicLinkAndRedirect({
          token,
          loginWithMagicLink,
          router,
        });
        console.log(
          `Authentification réussie, redirection vers ${MAGIC_LINK_SUCCESS_REDIRECT}`
        );
      } catch (err) {
        console.error("Erreur d'authentification:", err);
        const message =
          err instanceof Error ? err.message : "Lien magique invalide ou expiré";
        setError(message);
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
          {showError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          )}
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

export default function MagicLinkVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Chargement de la vérification du lien magique...
            </p>
          </div>
        </div>
      }
    >
      <MagicLinkVerifyContent />
    </Suspense>
  );
}
