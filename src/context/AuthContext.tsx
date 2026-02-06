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
  loginWithEmail: (email: string) => Promise<UserRole | null>;
  loginWithCredentials: (
    email: string,
    password: string,
    role: "examiner" | "admin"
  ) => Promise<void>;
  loginWithMagicLink: (token: string) => Promise<void>;
  logout: () => void;
};

// Identifiants prédéfinis pour la connexion
const PREDEFINED_CREDENTIALS = {
  admin: {
    email: "admin@exemple.com",
    password: "admin123",
  },
  examiner: {
    email: "examinateur@exemple.com", // Email réel de la base
    password: "examiner123",
  },
  student: {
    email: "student@example.com",
    // Les étudiants se connectent via un lien magique
  },
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
      // Appel à l'API backend au lieu des vérifications hardcodées
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        console.error("Erreur API:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Réponse API login:", data);

      // Conversion du rôle retourné par l'API (support des deux nomenclatures)
      if (data.role === "etudiant" || data.role === "student") {
        return "student";
      } else if (data.role === "examinateur" || data.role === "examiner") {
        return "examiner";
      } else if (data.role === "admin") {
        return "admin";
      }

      console.log("⚠️ Rôle non reconnu:", data.role);
      return null;
    } catch (error) {
      console.error("Erreur de vérification d'email:", error);
      return null;
    }
  };

  // Fonction pour se connecter avec email et mot de passe (examinateurs et admins)
  const loginWithCredentials = async (
    email: string,
    password: string,
    role: "examiner" | "admin"
  ) => {
    try {
      // Vérification des identifiants
      const validCredentials =
        (role === "admin" &&
          email === PREDEFINED_CREDENTIALS.admin.email &&
          password === PREDEFINED_CREDENTIALS.admin.password) ||
        (role === "examiner" &&
          email === PREDEFINED_CREDENTIALS.examiner.email &&
          password === PREDEFINED_CREDENTIALS.examiner.password);

      if (!validCredentials) {
        throw new Error("Identifiants invalides");
      }

      let userData: Examiner | Admin;

      if (role === "examiner") {
        userData = {
          id: "1",
          email,
          role: "examiner",
          firstName: "Examinateur",
          lastName: "Test",
          nom: "Test",
          prenom: "Examinateur",
          _id: "1",
          groupes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } else {
        userData = {
          id: "2",
          email,
          role: "admin",
          firstName: "Admin",
          lastName: "Système",
          nom: "Système",
          prenom: "Admin",
          _id: "2",
          groupes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

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
      console.log(`Vérification du token: ${token}`);

      // Appel à l'API pour vérifier le token
      const response = await fetch(
        `/api/auth/magic-link/verify?token=${token}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorPayload = await response
          .json()
          .catch(() => ({ error: "Token invalide ou expiré" }));
        const message =
          typeof errorPayload?.error === "string"
            ? errorPayload.error
            : "Token invalide ou expiré";
        throw new Error(message);
      }

      // Si la vérification réussit, créer l'utilisateur étudiant
      const data = await response.json();
      console.log("Données utilisateur reçues:", data);

      // Créer l'utilisateur étudiant avec les vraies données
      const student: Student = {
        id: "3",
        email: data.user.email,
        role: "student",
        firstName: data.user.prenom,
        lastName: data.user.nom,
        studentId: "STU123",
        nom: data.user.nom,
        prenom: data.user.prenom,
        _id: "6553f1ed4c3ef31ea8c03bc1",
        groupes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(student);
      setUserRole("student");
      setInStorage("user", JSON.stringify(student));
      setInStorage("userRole", "student");
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
