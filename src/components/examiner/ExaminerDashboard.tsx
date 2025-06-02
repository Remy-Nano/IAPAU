"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/AuthContext";
import { Brain, Menu, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Conversation {
  _id: string;
  studentId: string;
  versionFinale: {
    promptFinal: string;
    reponseIAFinale: string;
    soumisLe: Date;
  };
  createdAt: Date;
}

interface Evaluation {
  _id: string;
  conversationId: string;
  note: number;
  comment: string;
  gradedAt: Date;
  populatedConversation?: {
    versionFinale: {
      promptFinal: string;
      reponseIAFinale: string;
    };
    createdAt: Date;
  };
}

interface EvaluationForm {
  note: number;
  comment: string;
}

export default function ExaminerDashboard() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationForms, setEvaluationForms] = useState<
    Record<string, EvaluationForm>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [submittingEvals, setSubmittingEvals] = useState<Set<string>>(
    new Set()
  );

  const currentConversation = conversations.find(
    (conv) => conv._id === selectedConversation
  );

  // Récupérer les conversations avec version finale
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          "/api/conversations?withFinalVersion=true"
        );
        const data = await response.json();

        if (data.success) {
          setConversations(data.conversations);
        } else {
          toast.error("Erreur lors du chargement des conversations");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des conversations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Récupérer les évaluations existantes
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!user?._id) return;

      try {
        const response = await fetch(`/api/evaluations/examiner/${user._id}`);
        const data = await response.json();

        if (data.success) {
          setEvaluations(data.evaluations);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des évaluations:", error);
      }
    };

    fetchEvaluations();
  }, [user]);

  // Initialiser les formulaires d'évaluation
  useEffect(() => {
    const forms: Record<string, EvaluationForm> = {};
    conversations.forEach((conv) => {
      if (
        !evaluations.some(
          (evaluation) => evaluation.conversationId === conv._id
        )
      ) {
        forms[conv._id] = { note: 5, comment: "" };
      }
    });
    setEvaluationForms(forms);
  }, [conversations, evaluations]);

  // Vérification d'accès - uniquement pour les examinateurs
  if (user === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (user.role !== "examiner") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-700 mb-4">
            Vous n&apos;avez pas les autorisations nécessaires pour accéder à
            cette page.
          </p>
          <p className="text-sm text-gray-500">
            Cette page est réservée aux examinateurs.
          </p>
        </div>
      </div>
    );
  }

  const updateEvaluationForm = (
    conversationId: string,
    field: keyof EvaluationForm,
    value: string | number
  ) => {
    setEvaluationForms((prev) => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        [field]: value,
      },
    }));
  };

  const submitEvaluation = async (conversationId: string) => {
    if (!user?._id) {
      toast.error("Utilisateur non connecté");
      return;
    }

    const form = evaluationForms[conversationId];
    if (!form || !form.comment.trim()) {
      toast.error("Le commentaire est obligatoire");
      return;
    }

    const conversation = conversations.find((c) => c._id === conversationId);
    if (!conversation) {
      toast.error("Conversation introuvable");
      return;
    }

    setSubmittingEvals((prev) => new Set(prev).add(conversationId));

    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversationId,
          studentId: conversation.studentId,
          examinerId: user._id,
          note: form.note,
          comment: form.comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Évaluation soumise avec succès");
        // Recharger les évaluations
        const evalResponse = await fetch(
          `/api/evaluations/examiner/${user._id}`
        );
        const evalData = await evalResponse.json();
        if (evalData.success) {
          setEvaluations(evalData.evaluations);
        }
        // Supprimer le formulaire
        setEvaluationForms((prev) => {
          const newForms = { ...prev };
          delete newForms[conversationId];
          return newForms;
        });
      } else if (response.status === 409) {
        toast.error("Vous avez déjà noté cette conversation");
      } else {
        toast.error(data.error || "Erreur lors de la soumission");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la soumission");
    } finally {
      setSubmittingEvals((prev) => {
        const newSet = new Set(prev);
        newSet.delete(conversationId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <button
        className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex w-full md:w-64 bg-gray-900 text-white p-4 flex-col absolute md:relative inset-0 z-40`}
      >
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold">AI studio</h1>
        </div>

        <h2 className="text-lg font-medium mb-4">Conversations à évaluer</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {conversations
            .filter(
              (conv) =>
                !evaluations.some(
                  (evaluation) => evaluation.conversationId === conv._id
                )
            )
            .map((conv, index) => (
              <div
                key={conv._id}
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedConversation === conv._id
                    ? "bg-indigo-600"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => {
                  setSelectedConversation(conv._id);
                  setSidebarOpen(false);
                }}
              >
                <span className="font-medium">Conversation #{index + 1}</span>
                <div className="text-xs text-gray-300 mt-1">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>

        <h2 className="text-lg font-medium mb-4 mt-6">Mes évaluations</h2>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {evaluations.map((evaluation, index) => (
            <div
              key={evaluation._id}
              className="p-3 rounded-lg bg-green-800 text-sm"
            >
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="font-medium">{evaluation.note}/10</span>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                Éval #{index + 1} -{" "}
                {new Date(evaluation.gradedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
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

        <div className="flex-1 p-4 overflow-auto">
          {!selectedConversation ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 text-lg">
                  Sélectionnez une conversation à évaluer
                </p>
              </div>

              {/* Résumé des évaluations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Résumé de vos évaluations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {conversations.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Conversations disponibles
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {evaluations.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Évaluations terminées
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {conversations.length - evaluations.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Restant à évaluer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentConversation ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Évaluation de la conversation
              </h2>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Prompt final</h3>
                  <div className="p-4 bg-indigo-100 rounded-lg">
                    <p className="text-indigo-800 whitespace-pre-wrap">
                      {currentConversation.versionFinale.promptFinal}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">
                    Réponse IA finale
                  </h3>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {currentConversation.versionFinale.reponseIAFinale}
                    </p>
                  </div>
                </div>

                {evaluationForms[currentConversation._id] && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Votre évaluation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note ({evaluationForms[currentConversation._id].note}
                          /10)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={evaluationForms[currentConversation._id].note}
                          onChange={(e) =>
                            updateEvaluationForm(
                              currentConversation._id,
                              "note",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1</span>
                          <span>5</span>
                          <span>10</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commentaire (obligatoire)
                        </label>
                        <textarea
                          value={
                            evaluationForms[currentConversation._id].comment
                          }
                          onChange={(e) =>
                            updateEvaluationForm(
                              currentConversation._id,
                              "comment",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          rows={4}
                          placeholder="Votre commentaire sur cette conversation..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => submitEvaluation(currentConversation._id)}
                      disabled={
                        !evaluationForms[
                          currentConversation._id
                        ]?.comment.trim() ||
                        submittingEvals.has(currentConversation._id)
                      }
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingEvals.has(currentConversation._id)
                        ? "Soumission..."
                        : "Soumettre l'évaluation"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
