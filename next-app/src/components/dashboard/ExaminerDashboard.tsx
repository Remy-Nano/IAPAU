"use client";

import { Brain, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogoutButton } from "../auth/LogoutButton";

export const ExaminerDashboard: React.FC = () => {
  const { userRole } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [evaluation, setEvaluation] = useState({
    note: "",
    commentaire: ""
  });
  const [error, setError] = useState<string | null>(null);

  if (!userRole) {
    window.location.href = "/auth";
    return null;
  }

  if (userRole !== "examiner") {
    window.location.href = "/dashboard/admin"; // Rediriger vers le dashboard admin si ce n'est pas un examinateur
    return null;
  }

  // Données simulées
  const students = [
    {
      id: "1",
      name: "Élève 1",
      interactions: [
        {
          id: "i1",
          prompt: "Qu'est-ce que l'intelligence artificielle?",
          response:
            "L'intelligence artificielle est un domaine de l'informatique qui vise à créer des machines capables de simuler l'intelligence humaine.",
          timestamp: new Date().toLocaleDateString(),
        },
        {
          id: "i2",
          prompt: "Quels sont les types d'IA?",
          response:
            "On distingue l'IA faible (spécialisée dans une tâche) et l'IA forte (capable de comprendre et apprendre comme un humain).",
          timestamp: new Date().toLocaleDateString(),
        },
      ],
    },
    {
      id: "2",
      name: "Élève 2",
      interactions: [
        {
          id: "i3",
          prompt: "Comment fonctionne le machine learning?",
          response:
            "Le machine learning est une approche de l'IA qui permet aux systèmes d'apprendre à partir de données plutôt que d'être explicitement programmés.",
          timestamp: new Date().toLocaleDateString(),
        },
      ],
    },
  ];

  const currentStudent = students.find(
    (student) => student.id === selectedStudent
  );

  const handleEvaluationChange = (field: keyof typeof evaluation, value: string) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmitEvaluation = async () => {
    setError(null);
    
    if (!evaluation.note || !evaluation.commentaire) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      // Ici, vous pouvez implémenter la logique pour sauvegarder l'évaluation
      console.log("Evaluation soumise:", evaluation);
      // Réinitialiser le formulaire
      setEvaluation({ note: "", commentaire: "" });
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation:", error);
      setError('Une erreur est survenue lors de la soumission');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex w-full md:w-64 bg-gray-900 text-white p-4 flex-col absolute md:relative inset-0 z-40`}
      >
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold">AI studio</h1>
        </div>

        <h2 className="text-lg font-medium mb-4">Étudiants</h2>
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedStudent === student.id
                  ? "bg-indigo-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => {
                setSelectedStudent(student.id);
                setSidebarOpen(false);
              }}
            >
              <span className="font-medium">{student.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Tableau de bord examinateur
          </h1>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-green-200 text-green-800 rounded-lg">
              Examinateur
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Current View */}
        <div className="flex-1 overflow-auto">
          {currentStudent ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{currentStudent.name}</h2>
              <div className="space-y-4">
                {currentStudent.interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900">
                        {interaction.prompt}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {interaction.timestamp}
                      </p>
                    </div>
                    <div className="prose max-w-none">
                      <p>{interaction.response}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section d'évaluation */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Évaluation</h3>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={evaluation.note}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEvaluationChange('note', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire
                      </label>
                      <textarea
                        value={evaluation.commentaire}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEvaluationChange('commentaire', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    {error && (
                      <div className="text-red-500 text-sm mb-4">
                        {error}
                      </div>
                    )}
                    <button
                      onClick={handleSubmitEvaluation}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Soumettre l'évaluation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Brain className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Sélectionnez un étudiant</h3>
                <p className="mt-1 text-sm text-gray-500">Veuillez sélectionner un étudiant dans le menu de gauche</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

