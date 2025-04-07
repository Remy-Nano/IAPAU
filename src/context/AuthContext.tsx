<<<<<<< HEAD
import React, { createContext, useContext, useEffect, useState } from "react";
import { Admin, Examiner, Student, UserRole } from "../types";

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

=======
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../types';

type AuthContextType = {
  student: Student | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
<<<<<<< HEAD
    throw new Error("useAuth must be used within an AuthProvider");
=======
    throw new Error('useAuth must be used within an AuthProvider');
>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238
  }
  return context;
};

<<<<<<< HEAD
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<(Student | Examiner | Admin) | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Vérifier le localStorage au chargement
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("userRole") as UserRole | null;

    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setUserRole(storedRole);
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
        };
      } else {
        userData = {
          id: "2",
          email,
          role: "admin",
          firstName: "Admin",
          lastName: "Système",
        };
      }

      setUser(userData);
      setUserRole(role);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userRole", role);
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
      };

      setUser(mockStudent);
      setUserRole("student");
      localStorage.setItem("user", JSON.stringify(mockStudent));
      localStorage.setItem("userRole", "student");
    } catch (error) {
      console.error("Erreur de connexion avec lien magique:", error);
=======
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    // Vérifier le localStorage au chargement
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Vérification des identifiants de test
      if (email !== 'test@test.fr' || password !== 'test') {
        throw new Error('Identifiants invalides');
      }

      // Simulation d'authentification réussie avec les identifiants de test
      const mockStudent: Student = {
        id: '1',
        email: 'test@test.fr',
        firstName: 'Étudiant',
        lastName: 'Test',
        studentId: 'STU123'
      };
      
      // const response = await fetch('http://localhost:3000/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      
      setStudent(mockStudent);
      localStorage.setItem('student', JSON.stringify(mockStudent));
    } catch (error) {
      console.error('Erreur de connexion:', error);
>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238
      throw error;
    }
  };

  const logout = () => {
<<<<<<< HEAD
    setUser(null);
    setUserRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
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
=======
    setStudent(null);
    localStorage.removeItem('student');
  };

  return (
    <AuthContext.Provider value={{
      student,
      isAuthenticated: !!student,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238
