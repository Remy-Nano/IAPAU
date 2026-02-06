import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ExaminerAuthProps {
  onSubmit: (email: string, password: string) => void;
  email?: string;
}

export const ExaminerAuth: React.FC<ExaminerAuthProps> = ({ onSubmit, email: initialEmail = "" }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    onSubmit(email, password);
  };

  return (
    <div className="w-full">
      <div className="text-left mb-8 space-y-2">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] tracking-tight studia-font">
        Connexion examinateur
      </h2>
        <p className="text-sm text-[#0F172A]/65">
          Accès sécurisé par identifiants
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#0F172A]/70 mb-2 uppercase tracking-wide"
          >
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border border-[#E2E8F0]/80 rounded-xl bg-[#F8FAFC] placeholder:text-[#0F172A]/35 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/25 focus:border-[#38BDF8] transition-colors duration-200 hover:border-[#38BDF8]/35"
            placeholder="prenom.nom@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-[#0F172A]/70 mb-2 uppercase tracking-wide"
          >
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-3 py-2.5 sm:py-3 pr-11 text-sm sm:text-base border border-[#E2E8F0]/80 rounded-xl bg-[#F8FAFC] placeholder:text-[#0F172A]/35 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/25 focus:border-[#38BDF8] transition-colors duration-200 hover:border-[#38BDF8]/35"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-lg text-[#0F172A]/50 hover:text-[#0F172A]/80 hover:bg-[#0F172A]/5 transition"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 sm:py-3.5 px-4 bg-cyan-500 text-white text-sm sm:text-base font-semibold rounded-xl shadow-md shadow-cyan-500/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:ring-offset-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-cyan-600 active:scale-[0.99]"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};
