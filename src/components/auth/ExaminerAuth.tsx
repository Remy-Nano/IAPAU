import React, { useState } from "react";

interface ExaminerAuthProps {
  onSubmit: (email: string, password: string) => void;
}

export const ExaminerAuth: React.FC<ExaminerAuthProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("examiner@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <div className="w-full max-w-md mx-auto p-8 rounded-lg border border-gray-200 shadow-md">
      <h2 className="text-3xl font-bold text-center mb-8">
        Connexion examinateur
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};
