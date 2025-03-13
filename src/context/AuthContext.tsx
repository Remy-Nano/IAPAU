import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../types';

type AuthContextType = {
  student: Student | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
      throw error;
    }
  };

  const logout = () => {
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