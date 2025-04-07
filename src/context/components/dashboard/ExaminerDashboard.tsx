import { Brain } from "lucide-react";
import React, { useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";

export const ExaminerDashboard: React.FC = () => {
  const [firstNote, setFirstNote] = useState<string>("");
  const [secondNote, setSecondNote] = useState<string>("");
  const [firstComment, setFirstComment] = useState<string>("");
  const [secondComment, setSecondComment] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous implémenteriez la logique pour soumettre les notes et commentaires
    console.log("Notes soumises:", {
      firstNote,
      secondNote,
      firstComment,
      secondComment,
    });
    alert("Notes soumises avec succès (simulation)");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold">AI studio</h1>
        </div>

        <div className="mt-8">
          <div className="p-3 rounded-lg bg-gray-800 cursor-pointer">
            <span className="font-medium">Correction examinateur</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="px-4 py-2 bg-gray-200 rounded-lg">Étudiant</div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gray-200 rounded-lg">Examinateur</div>
            <LogoutButton />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Left Column - Prompts History */}
          <div className="w-1/2 p-4 bg-gray-300">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Historique des prompts
            </h2>
            <div className="bg-gray-300 h-full"></div>
          </div>

          {/* Right Column - AI Responses */}
          <div className="w-1/2 p-4 bg-gray-300 border-l border-gray-400">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Historique des réponses de l'IA
            </h2>
            <div className="bg-gray-300 h-full"></div>
          </div>
        </div>

        {/* Grading Area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="w-1/2 space-y-2">
              <input
                type="text"
                value={firstNote}
                onChange={(e) => setFirstNote(e.target.value)}
                placeholder="Première note /10"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <textarea
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                placeholder="Écrivez votre commentaire ici..."
                className="w-full p-3 border border-gray-300 rounded-md h-24"
              />
            </div>

            <div className="w-1/2 space-y-2">
              <input
                type="text"
                value={secondNote}
                onChange={(e) => setSecondNote(e.target.value)}
                placeholder="Deuxième note /10"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <textarea
                value={secondComment}
                onChange={(e) => setSecondComment(e.target.value)}
                placeholder="Écrivez votre commentaire ici..."
                className="w-full p-3 border border-gray-300 rounded-md h-24"
              />
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 self-end"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
