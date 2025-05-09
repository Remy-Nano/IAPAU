'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole } from "@/types";
import { AuthService } from "@/services/authService";

type AuthContextType = {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string) => Promise<UserRole | null>;
  loginWithCredentials: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const role = await AuthService.getRole();
        if (role) {
          setUserRole(role);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      }
    };
    checkAuth();
  }, []);

  const loginWithEmail = async (email: string): Promise<UserRole | null> => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier les identifiants en dur (temporaire)
      let role: UserRole | null = null;
      if (email === "admin@example.com") {
        role = "admin";
      } else if (email === "examiner@example.com") {
        role = "examiner";
      } else if (email === "student@example.com") {
        role = "student";
      } else {
        setError("Utilisateur non trouvé");
        return null;
      }

      if (role) {
        await AuthService.setSession(role);
        setUserRole(role);
        return role; // Retourne le rôle immédiatement
      }

      return null;
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, password: string, role: UserRole): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier les identifiants en dur (temporaire)
      const isValid = 
        (role === "admin" && email === "admin@example.com" && password === "admin123") ||
        (role === "examiner" && email === "examiner@example.com" && password === "examiner123");

      if (isValid) {
        await AuthService.setSession(role);
        setUserRole(role);
      } else {
        setError("Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.clearSession();
    setUserRole(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        isAuthenticated: userRole !== null,
        loading,
        error,
        loginWithEmail,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
