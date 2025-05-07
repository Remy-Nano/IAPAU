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
    email: "admin@example.com",
    password: "admin123",
  },
  examiner: {
    email: "examiner@example.com",
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
      // Vérification des emails prédéfinis
      let role: UserRole | null = null;

      if (email === PREDEFINED_CREDENTIALS.admin.email) {
        role = "admin";
      } else if (email === PREDEFINED_CREDENTIALS.examiner.email) {
        role = "examiner";
      } else if (email === PREDEFINED_CREDENTIALS.student.email) {
        role = "student";
        // Simuler l'envoi d'un email avec un lien magique
        console.log(`Envoi d'un lien magique à ${email}`);
      } else {
        return null;
      }

      return role;
    } catch (error) {
      console.error("Erreur de vérification d'email:", error);
      throw error;
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
      // Simulation de vérification du token pour le développement frontend
      // Dans une implémentation réelle, vous enverriez le token au backend pour validation
      console.log(`Vérification du token: ${token}`);

      const mockStudent: Student = {
        id: "3",
        email: PREDEFINED_CREDENTIALS.student.email,
        role: "student",
        firstName: "Étudiant",
        lastName: "Test",
        studentId: "STU123",
        nom: "Test",
        prenom: "Étudiant",
        _id: "3",
        groupes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockStudent);
      setUserRole("student");
      setInStorage("user", JSON.stringify(mockStudent));
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
