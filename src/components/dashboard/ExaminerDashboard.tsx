import { Brain, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";

export const ExaminerDashboard: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                setSidebarOpen(false); // Ferme le menu sur mobile après sélection
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

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-auto">
          {!selectedStudent ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">
                Sélectionnez un étudiant pour voir ses interactions
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Interactions de {currentStudent?.name}
              </h2>

              {currentStudent?.interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="bg-white rounded-lg shadow-md p-4 md:p-6"
                >
                  <div className="mb-4">
                    <span className="text-xs text-gray-500">
                      {interaction.timestamp}
                    </span>
                    <div className="mt-2 p-3 md:p-4 bg-indigo-100 rounded-lg">
                      <p className="text-sm md:text-base text-indigo-800">
                        <strong>Prompt:</strong> {interaction.prompt}
                      </p>
                    </div>
                    <div className="mt-2 p-3 md:p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm md:text-base text-gray-800">
                        <strong>Réponse:</strong> {interaction.response}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-base md:text-lg font-medium mb-3">
                      Évaluation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Note (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commentaire
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={2}
                        ></textarea>
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Soumettre l'évaluation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
