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
        const rawMessage =
          err instanceof Error ? err.message : "Lien magique invalide ou expiré";
        const normalized = rawMessage.toLowerCase();
        const friendlyMessage =
          normalized.includes("non reconnu") ||
          normalized.includes("déjà") ||
          normalized.includes("deja") ||
          normalized.includes("expiré") ||
          normalized.includes("expire")
            ? "Lien déjà utilisé. Demande un nouveau lien."
            : rawMessage;
        setError(friendlyMessage);
        setIsProcessing(false);
      }
    };

    verifyToken();
  }, [searchParams, loginWithMagicLink, router, isProcessing]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-[#F3F7FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-[#0F172A]/70">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F7FB] flex items-center justify-center">
        <div className="text-center">
          {showError ? (
            <div className="bg-red-100/80 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          )}
          <button
            onClick={() => router.push("/login")}
            className="bg-cyan-500 text-white px-4 py-2 rounded-xl hover:bg-cyan-600 shadow-md shadow-cyan-500/20 transition-colors"
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
        <div className="min-h-screen bg-[#F3F7FB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-[#0F172A]/70">
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
