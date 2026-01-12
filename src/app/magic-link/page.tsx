"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function MagicLinkContent() {
  const { loginWithMagicLink } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    console.log("MagicLinkPage - Token:", token, "IsProcessing:", isProcessing);

    if (isProcessing) return;

    if (!token) {
      console.log("Pas de token trouvé, redirection vers /login");
      router.push("/login");
      return;
    }

    const verify = async () => {
      setIsProcessing(true);
      try {
        console.log("Tentative d'authentification avec token:", token);
        await loginWithMagicLink(token);
        console.log(
          "Authentification réussie, redirection vers /dashboard/student"
        );
        router.push("/dashboard/student");
      } catch (err) {
        console.error("Erreur de lien magique :", err);
        setError("Erreur d'authentification. Veuillez réessayer.");
        router.push("/login");
      }
    };

    verify();
  }, [searchParams, loginWithMagicLink, router, isProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-6 rounded shadow">
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-700">
              Connexion en cours via lien magique...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-6 rounded shadow">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-700">
            Chargement du lien magique...
          </p>
        </div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}