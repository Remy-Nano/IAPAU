"use client";

import { Admin, Examiner, Student, UserRole } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

// Fonction utilitaire pour vérifier si on est côté client
const isClient = typeof window !== "undefined";

// Fonctions utilitaires pour localStorage
const getFromStorage = (key: string): string | null => {
  if (!isClient) return null;
  return localStorage.getItem(key);
};

const setInStorage = (key: string, value: string): void => {
  if (!isClient) return;
  localStorage.setItem(key, value);
};

const removeFromStorage = (key: string): void => {
  if (!isClient) return;
  localStorage.removeItem(key);
};

type AuthContextType = {
  user: (Student | Examiner | Admin) | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string) => Promise<UserRole | null>;
  loginWithCredentials: (
    email: string,
    password: string,
    role: "examiner" | "admin"
  ) => Promise<void>;
  loginWithMagicLink: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<(Student | Examiner | Admin) | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier le localStorage au chargement, mais seulement côté client
    if (isClient) {
      const storedUser = getFromStorage("user");
      const storedRole = getFromStorage("userRole") as UserRole | null;

      if (storedUser && storedRole) {
        setUser(JSON.parse(storedUser));
        setUserRole(storedRole);
      }
    }
  }, []);

  // Fonction pour vérifier le type d'utilisateur à partir de l'email
  const loginWithEmail = async (email: string): Promise<UserRole | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Validation de l'email côté client
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Format d\'email invalide');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la connexion');
      }

      const data = await response.json();
      const role = data.role as UserRole;
      return role;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour se connecter avec email et mot de passe (examinateurs et admins)
  const loginWithCredentials = async (
    email: string,
    password: string,
    role: "examiner" | "admin"
  ) => {
    try {
      // Vérifier l'utilisateur dans la base de données
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Identifiants invalides");
      }

      const userData = await response.json();
      setUser(userData);
      setUserRole(role);
      setInStorage("user", JSON.stringify(userData));
      setInStorage("userRole", role);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  };

  // Fonction pour se connecter avec un lien magique (étudiants)
  const loginWithMagicLink = async (token: string) => {
    try {
      // Vérifier le token auprès du backend
      const response = await fetch('/api/auth/magic-link/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Le token est passé dans l'URL par le middleware
      });

      if (!response.ok) {
        throw new Error("Lien magique invalide ou expiré");
      }

      // Le backend gère déjà la redirection, donc on ne fait rien ici
    } catch (error) {
      console.error("Erreur de connexion avec lien magique:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    removeFromStorage("user");
    removeFromStorage("userRole");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAuthenticated: !!user,
        loading,
        error,
        loginWithEmail,
        loginWithCredentials,
        loginWithMagicLink,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
