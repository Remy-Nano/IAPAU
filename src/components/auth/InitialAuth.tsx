import React, { useState } from "react";

interface InitialAuthProps {
  onSubmit: (email: string) => void;
}

export const InitialAuth: React.FC<InitialAuthProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Veuillez entrer une adresse email");
      return;
    }

    onSubmit(email);
  };

  return (
    <div>
      <div className="text-left mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] tracking-tight studia-font">
          Connexion
        </h2>
        <p className="text-sm text-[#0F172A]/60">
          Entrez votre email pour continuer.
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
