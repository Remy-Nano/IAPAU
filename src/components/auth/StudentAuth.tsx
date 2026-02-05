import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StudentAuthProps {
  email: string;
}

export const StudentAuth: React.FC<StudentAuthProps> = ({ email }) => {
  const { loginWithEmail } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email || isSending) return;
    setIsSending(true);
    setStatusMessage(null);
    try {
      await loginWithEmail(email);
      setStatusMessage("Lien renvoyé.");
    } catch (error) {
      console.error("Erreur renvoi lien:", error);
      setStatusMessage("Impossible de renvoyer le lien.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] tracking-tight">
        Lien envoyé
      </h2>
      <p className="text-sm text-[#0F172A]/65 mt-2">
        Connexion par lien magique
      </p>
      <p className="text-sm text-[#0F172A]/70 mt-3">
        Accédez à vos challenges, conversations et résultats.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-4 py-3 text-left">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#38BDF8]/20 text-[#38BDF8]">
          <Mail className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-[#0F172A]">
            Vérifie ta boîte mail : un lien magique vient d’être envoyé.
          </p>
          <p className="text-xs text-[#0F172A]/60">
            Pense à vérifier tes spams.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-[#0F172A]/80 text-white text-sm sm:text-base font-semibold rounded-xl shadow-md shadow-[#0F172A]/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/40 focus:ring-offset-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.99]"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isSending}
          className="w-full text-xs text-[#0F172A]/70 hover:text-[#0F172A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? "Renvoi en cours..." : "Renvoyer le lien"}
        </button>
        {statusMessage && (
          <p className="text-[11px] text-[#0F172A]/60 text-center">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
