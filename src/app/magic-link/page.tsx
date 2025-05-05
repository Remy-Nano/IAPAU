"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function MagicLinkPage() {
  const { loginWithMagicLink } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/auth");
      return;
    }

    const verify = async () => {
      try {
        await loginWithMagicLink(token);
        router.push("/dashboard/student");
      } catch (err) {
        console.error("Erreur de lien magique :", err);
        router.push("/auth");
      }
    };

    verify();
  }, [searchParams, loginWithMagicLink, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-6 rounded shadow">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-indigo-600" />
        <p className="text-gray-700">Connexion en cours via lien magique...</p>
      </div>
    </div>
  );
}
