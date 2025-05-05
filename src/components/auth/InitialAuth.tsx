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

  const fillEmail = (emailType: "student" | "examiner" | "admin") => {
    switch (emailType) {
      case "student":
        setEmail("student@example.com");
        break;
      case "examiner":
        setEmail("examiner@example.com");
        break;
      case "admin":
        setEmail("admin@example.com");
        break;
    }
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Authentification
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <input
            type="email"
            id="email"
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => fillEmail("student")}
            className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
          >
            Étudiant
          </button>
          <button
            type="button"
            onClick={() => fillEmail("examiner")}
            className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
          >
            Examinateur
          </button>
          <button
            type="button"
            onClick={() => fillEmail("admin")}
            className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 sm:py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};
