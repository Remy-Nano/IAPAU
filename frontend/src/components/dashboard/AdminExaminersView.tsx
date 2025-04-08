import { Brain, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";

type Examiner = {
  id: string;
  name: string;
  email: string;
};

interface AdminExaminersViewProps {
  onNavigateToStudents: () => void;
}

export const AdminExaminersView: React.FC<AdminExaminersViewProps> = ({
  onNavigateToStudents,
}) => {
  const [examiners, setExaminers] = useState<Examiner[]>([
    { id: "1", name: "...............", email: "..............." },
    { id: "2", name: "...............", email: "..............." },
    { id: "3", name: "...............", email: "..............." },
    { id: "4", name: "...............", email: "..............." },
    { id: "5", name: "...............", email: "..............." },
  ]);

  const handleAddExaminer = () => {
    // Ici, vous implémenteriez la logique pour ajouter un examinateur
    alert("Ajout d'un nouvel examinateur (simulation)");
  };

  const handleEditExaminer = (id: string) => {
    // Ici, vous implémenteriez la logique pour modifier un examinateur
    console.log("Modification de l'examinateur:", id);
    alert(`Modification de l'examinateur ${id} (simulation)`);
  };

  const handleDeleteExaminer = (id: string) => {
    // Ici, vous implémenteriez la logique pour supprimer un examinateur
    console.log("Suppression de l'examinateur:", id);
    setExaminers(examiners.filter((examiner) => examiner.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold">AI studio</h1>
        </div>

        <div className="mt-8 space-y-2">
          <h2 className="px-3 text-lg font-medium">Administration</h2>

          <div className="p-3 rounded-lg bg-gray-800 cursor-pointer">
            <span className="font-medium">Examinateurs</span>
          </div>

          <div
            className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer"
            onClick={onNavigateToStudents}
          >
            <span className="font-medium">Étudiants</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestion des examinateurs</h2>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gray-200 rounded-lg">
              Administrateur
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Liste des examinateurs</h2>
              <button
                onClick={handleAddExaminer}
                className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 flex items-center"
              >
                <span className="mr-1">+</span> Nouvel examinateur
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-6 text-left text-gray-500 font-medium">
                      Nom
                    </th>
                    <th className="py-3 px-6 text-left text-gray-500 font-medium">
                      Mail
                    </th>
                    <th className="py-3 px-6 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {examiners.map((examiner) => (
                    <tr key={examiner.id} className="border-b border-gray-200">
                      <td className="py-4 px-6">{examiner.name}</td>
                      <td className="py-4 px-6">{examiner.email}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleEditExaminer(examiner.id)}
                          className="bg-indigo-100 text-indigo-600 rounded-lg px-4 py-2 mr-2"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteExaminer(examiner.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
