import { Brain, ChevronDown, Mail, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";

type Student = {
  id: string;
  name: string;
  email: string;
  examiner: string;
};

export const AdminStudentsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      name: "...............",
      email: "...............",
      examiner: "...............",
    },
    {
      id: "2",
      name: "...............",
      email: "...............",
      examiner: "...............",
    },
    {
      id: "3",
      name: "...............",
      email: "...............",
      examiner: "...............",
    },
    {
      id: "4",
      name: "...............",
      email: "...............",
      examiner: "...............",
    },
    {
      id: "5",
      name: "...............",
      email: "...............",
      examiner: "...............",
    },
  ]);

  const handleAddStudent = () => {
    // Ici, vous implémenteriez la logique pour ajouter un étudiant
    alert("Ajout d'un nouvel étudiant (simulation)");
  };

  const handleEditStudent = (id: string) => {
    // Ici, vous implémenteriez la logique pour modifier un étudiant
    console.log("Modification de l'étudiant:", id);
    alert(`Modification de l'étudiant ${id} (simulation)`);
  };

  const handleDeleteStudent = (id: string) => {
    // Ici, vous implémenteriez la logique pour supprimer un étudiant
    console.log("Suppression de l'étudiant:", id);
    setStudents(students.filter((student) => student.id !== id));
  };

  const handleSendMagicLink = (id: string) => {
    // Ici, vous implémenteriez la logique pour envoyer un lien magique
    console.log("Envoi d'un lien magique à l'étudiant:", id);
    alert(`Lien magique envoyé à l'étudiant ${id} (simulation)`);
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

          <div className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer">
            <span className="font-medium">Étudiants</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestion des étudiants</h2>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gray-200 rounded-lg">
              Administrateur
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="p-4 md:p-8 h-full overflow-auto">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold">Liste des étudiants</h2>
                <button
                  onClick={handleAddStudent}
                  className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 flex items-center self-stretch md:self-auto"
                >
                  <span className="mr-1">+</span> Nouvel étudiant
                </button>
              </div>

              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="min-w-full">
                  <thead className="hidden md:table-header-group">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-2 md:px-6 text-left text-gray-500 font-medium">
                        Nom
                      </th>
                      <th className="py-3 px-2 md:px-6 text-left text-gray-500 font-medium">
                        Mail
                      </th>
                      <th className="py-3 px-2 md:px-6 text-left text-gray-500 font-medium">
                        Examinateur
                      </th>
                      <th className="py-3 px-2 md:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-gray-200 flex flex-col md:table-row"
                      >
                        <td className="py-2 md:py-4 px-2 md:px-6 flex flex-col md:block">
                          <span className="font-medium text-gray-500 md:hidden">
                            Nom:
                          </span>
                          <span>{student.name}</span>
                        </td>
                        <td className="py-2 md:py-4 px-2 md:px-6 flex flex-col md:block">
                          <span className="font-medium text-gray-500 md:hidden">
                            Mail:
                          </span>
                          <span>{student.email}</span>
                        </td>
                        <td className="py-2 md:py-4 px-2 md:px-6 flex flex-col md:block">
                          <span className="font-medium text-gray-500 md:hidden">
                            Examinateur:
                          </span>
                          <div className="flex items-center">
                            <span>{student.examiner}</span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </div>
                        </td>
                        <td className="py-2 md:py-4 px-2 md:px-6 flex justify-start md:justify-end items-center gap-2">
                          <button
                            onClick={() => handleSendMagicLink(student.id)}
                            className="text-green-500 hover:text-green-700"
                            title="Envoyer un lien magique"
                          >
                            <Mail className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student.id)}
                            className="bg-indigo-100 text-indigo-600 rounded-lg px-3 py-1 md:px-4 md:py-2 text-sm md:text-base"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
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
    </div>
  );
};
