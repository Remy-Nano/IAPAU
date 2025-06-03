"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/AuthContext";
import {
  Evaluation,
  EvaluationForm,
  ExaminerConversation,
} from "@/types/conversation";
import { Brain, Home, Menu, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// CSS personnalisé pour le slider
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #4f46e5;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #4f46e5;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
`;

interface HackathonOption {
  _id: string;
  nom: string;
  statut: string;
  dates: {
    debut: string;
    fin: string;
  };
}

interface TacheOption {
  id: string;
  nom: string;
  hackathonId: string;
}

export default function ExaminerDashboard() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(
    null
  );
  const [selectedHackathon, setSelectedHackathon] = useState<string>("all");
  const [selectedTache, setSelectedTache] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ExaminerConversation[]>(
    []
  );
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [hackathons, setHackathons] = useState<HackathonOption[]>([]);
  const [taches, setTaches] = useState<TacheOption[]>([]);
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

  const currentEvaluation = evaluations.find(
    (evaluation) => evaluation._id === selectedEvaluation
  );

  const currentEvaluationConversation = currentEvaluation
    ? conversations.find(
        (conv) => conv._id === currentEvaluation.conversationId
      )
    : null;

  // Mode actuel : 'evaluation' pour évaluer, 'review' pour réviser
  const currentMode = selectedEvaluation ? "review" : "evaluation";

  // Récupérer les hackathons disponibles
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await fetch("/api/hackathons");
        const data = await response.json();

        if (Array.isArray(data)) {
          setHackathons(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des hackathons:", error);
      }
    };

    fetchHackathons();
  }, []);

  // Récupérer les tâches du hackathon sélectionné
  useEffect(() => {
    const fetchTaches = async () => {
      if (selectedHackathon === "all") {
        setTaches([]);
        setSelectedTache("all");
        return;
      }

      try {
        const response = await fetch(
          `/api/hackathons/${selectedHackathon}?tasksOnly=true`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.taches)) {
          setTaches(data.taches);
        } else {
          setTaches([]);
        }
        // Réinitialiser la sélection de tâche quand on change de hackathon
        setSelectedTache("all");
      } catch (error) {
        console.error("Erreur lors du chargement des tâches:", error);
        setTaches([]);
        setSelectedTache("all");
      }
    };

    fetchTaches();
  }, [selectedHackathon]);

  // Récupérer les conversations avec version finale
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        let url = "/api/conversations?withFinalVersion=true";
        if (selectedHackathon !== "all") {
          url += `&hackathonId=${selectedHackathon}`;
        }
        if (selectedTache !== "all") {
          url += `&tacheId=${selectedTache}`;
        }

        const response = await fetch(url);
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
  }, [user?._id, selectedHackathon, selectedTache]); // Dépendance ajoutée

  // Récupérer les évaluations existantes
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!user?._id) return;

      try {
        let url = `/api/evaluations/examiner/${user._id}`;
        const params = [];
        if (selectedHackathon !== "all") {
          params.push(`hackathonId=${selectedHackathon}`);
        }
        if (selectedTache !== "all") {
          params.push(`tacheId=${selectedTache}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          console.error("API Error:", response.status, response.statusText);
          return;
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.evaluations)) {
          setEvaluations(data.evaluations);
          console.log(`✅ Chargé ${data.evaluations.length} évaluations`);
        } else {
          console.error("Invalid API response structure:", data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des évaluations:", error);
      }
    };

    fetchEvaluations();
  }, [user?._id, selectedHackathon, selectedTache]); // Dépendance ajoutée

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
  }, [conversations.length, evaluations.length]); // Dépendances optimisées

  // S'assurer qu'un formulaire existe pour la conversation courante
  const ensureFormExists = (conversationId: string) => {
    if (!evaluationForms[conversationId]) {
      setEvaluationForms((prev) => ({
        ...prev,
        [conversationId]: { note: 5, comment: "" },
      }));
    }
  };

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

    // Vérification du studentId
    if (!conversation.studentId) {
      toast.error(
        "Cette conversation n'a pas d'ID étudiant associé et ne peut pas être évaluée"
      );
      console.error("Conversation sans studentId:", conversation);
      return;
    }

    const payload = {
      conversationId: conversationId,
      studentId: conversation.studentId,
      examinerId: user._id,
      note: form.note,
      comment: form.comment.trim(),
    };

    console.log("🔍 DEBUG - Payload à envoyer:", payload);
    console.log("🔍 DEBUG - Conversation complète:", conversation);
    console.log("🔍 DEBUG - User complet:", user);
    console.log("🔍 DEBUG - Form data:", form);

    setSubmittingEvals((prev) => new Set(prev).add(conversationId));

    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("🔍 DEBUG - Response status:", response.status);

      const data = await response.json();
      console.log("🔍 DEBUG - Response data:", data);

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
    <div
      className="flex flex-col md:flex-row h-screen bg-gray-100"
      suppressHydrationWarning
    >
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />

      <button
        className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex w-full md:w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex-col absolute md:relative inset-0 z-40 shadow-2xl`}
      >
        <div className="flex items-center space-x-2 mb-8">
          <Brain className="h-8 w-8 text-indigo-400" />
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-purple-300 transition-all cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            Prompt Challenge
          </Link>
        </div>

        {/* Section: Conversations à évaluer */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-3 mb-4 shadow-lg">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Star className="h-5 w-5 mr-2" />À évaluer
            </h2>
            <div className="text-sm text-amber-100 mt-1">
              {
                conversations.filter(
                  (conv) =>
                    conv.studentId &&
                    !evaluations.some(
                      (evaluation) => evaluation.conversationId === conv._id
                    )
                ).length
              }{" "}
              conversation(s)
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {conversations
              .filter(
                (conv) =>
                  conv.studentId && // Seulement les conversations avec studentId
                  !evaluations.some(
                    (evaluation) => evaluation.conversationId === conv._id
                  )
              )
              .map((conv, index) => (
                <div
                  key={conv._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedConversation === conv._id
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 shadow-lg transform scale-105"
                      : "bg-slate-700/50 hover:bg-slate-600/70 border-slate-600 hover:border-amber-400"
                  }`}
                  onClick={() => {
                    setSelectedConversation(conv._id);
                    setSelectedEvaluation(null);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="font-medium text-white">
                    Conversation #{index + 1}
                  </span>
                  <div className="text-xs text-gray-300 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

            {/* Message si aucune conversation disponible */}
            {conversations.filter(
              (conv) =>
                conv.studentId &&
                !evaluations.some(
                  (evaluation) => evaluation.conversationId === conv._id
                )
            ).length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm bg-slate-700/30 rounded-lg border border-slate-600">
                {conversations.length === 0 ? (
                  <>
                    <Star className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    Aucune conversation disponible
                    {(selectedHackathon !== "all" ||
                      selectedTache !== "all") && (
                      <div className="text-xs text-gray-500 mt-1">
                        pour les filtres sélectionnés
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    Toutes les conversations ont été évaluées !
                    {(selectedHackathon !== "all" ||
                      selectedTache !== "all") && (
                      <div className="text-xs text-green-400 mt-1">
                        pour les filtres sélectionnés
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section: Mes évaluations */}
        <div className="flex-1">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-3 mb-4 shadow-lg">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Mes évaluations
            </h2>
            <div className="text-sm text-emerald-100 mt-1">
              {evaluations.length} évaluation(s) terminée(s) • Cliquez pour
              réviser
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-80">
            {evaluations.map((evaluation, index) => (
              <div
                key={evaluation._id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  selectedEvaluation === evaluation._id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 shadow-lg transform scale-105"
                    : "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/30 hover:from-emerald-600/30 hover:to-teal-600/30"
                }`}
                onClick={() => {
                  setSelectedEvaluation(evaluation._id);
                  setSelectedConversation(null); // Désélectionner les conversations à évaluer
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        evaluation.note >= 8
                          ? "bg-green-500 text-white"
                          : evaluation.note >= 6
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {evaluation.note}/10
                    </div>
                    <span className="text-emerald-300 font-medium">
                      Éval #{evaluations.length - index}
                    </span>
                  </div>
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="text-xs text-gray-300 mb-2">
                  {new Date(evaluation.gradedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2 italic">
                  &ldquo;{evaluation.comment}&rdquo;
                </div>
              </div>
            ))}

            {evaluations.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm bg-slate-700/30 rounded-lg border border-slate-600">
                <Star className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                Aucune évaluation effectuée
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Section titre et navigation */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800">
                Tableau de bord examinateur
              </h1>
              <Link
                href="/"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </div>

            {/* Section filtrage hackathon et tâches */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Sélecteur Hackathon */}
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <Brain className="h-4 w-4 text-indigo-600" />
                <label className="text-sm font-medium text-indigo-700">
                  Hackathon :
                </label>
                <select
                  value={selectedHackathon}
                  onChange={(e) => {
                    setSelectedHackathon(e.target.value);
                    // Réinitialiser les sélections lors du changement de hackathon
                    setSelectedConversation(null);
                    setSelectedEvaluation(null);
                  }}
                  className="bg-white border border-indigo-300 rounded-md px-3 py-1 text-sm font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-400"
                >
                  <option value="all">🌟 Tous les hackathons</option>
                  {hackathons.map((hackathon) => (
                    <option key={hackathon._id} value={hackathon._id}>
                      {hackathon.nom}
                      {hackathon.statut && ` (${hackathon.statut})`}
                    </option>
                  ))}
                </select>
                {selectedHackathon !== "all" && (
                  <button
                    onClick={() => {
                      setSelectedHackathon("all");
                      setSelectedConversation(null);
                      setSelectedEvaluation(null);
                    }}
                    className="text-indigo-500 hover:text-indigo-700 text-xs font-medium underline transition-colors"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {/* Sélecteur Tâches */}
              {selectedHackathon !== "all" && taches.length > 0 && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <Star className="h-4 w-4 text-emerald-600" />
                  <label className="text-sm font-medium text-emerald-700">
                    Tâche :
                  </label>
                  <select
                    value={selectedTache}
                    onChange={(e) => {
                      setSelectedTache(e.target.value);
                      // Réinitialiser les sélections lors du changement de tâche
                      setSelectedConversation(null);
                      setSelectedEvaluation(null);
                    }}
                    className="bg-white border border-emerald-300 rounded-md px-3 py-1 text-sm font-medium text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-400"
                  >
                    <option value="all">📋 Toutes les tâches</option>
                    {taches.map((tache) => (
                      <option key={tache.id} value={tache.id}>
                        {tache.nom}
                      </option>
                    ))}
                  </select>
                  {selectedTache !== "all" && (
                    <button
                      onClick={() => {
                        setSelectedTache("all");
                        setSelectedConversation(null);
                        setSelectedEvaluation(null);
                      }}
                      className="text-emerald-500 hover:text-emerald-700 text-xs font-medium underline transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Section utilisateur */}
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-200 text-green-800 rounded-lg">
                Examinateur
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-auto">
          {/* Indicateur du hackathon sélectionné */}
          {(selectedHackathon !== "all" || selectedTache !== "all") && (
            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">
                    Filtrage actif :
                  </span>
                  {selectedHackathon !== "all" && (
                    <span className="text-sm font-bold text-indigo-800">
                      {hackathons.find((h) => h._id === selectedHackathon)
                        ?.nom || selectedHackathon}
                    </span>
                  )}
                  {selectedTache !== "all" && (
                    <>
                      <span className="text-indigo-600">→</span>
                      <Star className="h-3 w-3 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700">
                        {taches.find((t) => t.id === selectedTache)?.nom ||
                          selectedTache}
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedHackathon("all");
                    setSelectedTache("all");
                    setSelectedConversation(null);
                    setSelectedEvaluation(null);
                  }}
                  className="text-indigo-500 hover:text-indigo-700 text-xs font-medium px-2 py-1 rounded border border-indigo-300 hover:border-indigo-400 transition-colors"
                >
                  Effacer tout
                </button>
              </div>
            </div>
          )}

          {!selectedConversation && !selectedEvaluation ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 text-lg">
                  Sélectionnez une conversation à évaluer ou une évaluation à
                  réviser
                </p>
              </div>

              {/* Résumé des évaluations */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  Tableau de bord des évaluations
                  {selectedHackathon !== "all" && (
                    <span className="ml-3 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full">
                      {hackathons.find((h) => h._id === selectedHackathon)
                        ?.nom || "Hackathon filtré"}
                    </span>
                  )}
                  {selectedTache !== "all" && (
                    <span className="ml-2 px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-full">
                      {taches.find((t) => t.id === selectedTache)?.nom ||
                        "Tâche filtrée"}
                    </span>
                  )}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group hover:scale-105 transition-transform duration-300">
                    <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {conversations.filter((conv) => conv.studentId).length}
                      </div>
                      <div className="text-sm font-medium text-amber-700">
                        Conversations disponibles
                        {(selectedHackathon !== "all" ||
                          selectedTache !== "all") && (
                          <div className="text-xs text-amber-600 mt-1">
                            (filtres actifs)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="group hover:scale-105 transition-transform duration-300">
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-emerald-600 mb-1">
                        {evaluations.length}
                      </div>
                      <div className="text-sm font-medium text-emerald-700">
                        Évaluations terminées
                        {(selectedHackathon !== "all" ||
                          selectedTache !== "all") && (
                          <div className="text-xs text-emerald-600 mt-1">
                            (filtres actifs)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="group hover:scale-105 transition-transform duration-300">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {conversations.filter((conv) => conv.studentId).length -
                          evaluations.length}
                      </div>
                      <div className="text-sm font-medium text-blue-700">
                        Restant à évaluer
                        {(selectedHackathon !== "all" ||
                          selectedTache !== "all") && (
                          <div className="text-xs text-blue-600 mt-1">
                            (filtres actifs)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progression des évaluations
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(
                        (evaluations.length /
                          Math.max(
                            conversations.filter((conv) => conv.studentId)
                              .length,
                            1
                          )) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.round(
                          (evaluations.length /
                            Math.max(
                              conversations.filter((conv) => conv.studentId)
                                .length,
                              1
                            )) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentMode === "review" &&
            currentEvaluation &&
            currentEvaluationConversation ? (
            // Mode révision d'une évaluation terminée
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Star className="h-5 w-5 text-emerald-500 mr-2" />
                  Révision d&apos;évaluation terminée
                </h2>
                <button
                  onClick={() => {
                    setSelectedEvaluation(null);
                    setSelectedConversation(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Retour au tableau de bord
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Informations sur l'évaluation */}
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-emerald-800">
                      Votre évaluation
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          currentEvaluation.note >= 8
                            ? "bg-green-500 text-white"
                            : currentEvaluation.note >= 6
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {currentEvaluation.note}/10
                      </div>
                      <span className="text-emerald-600 text-sm">
                        Évaluée le{" "}
                        {new Date(
                          currentEvaluation.gradedAt
                        ).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-emerald-200">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Votre commentaire :
                    </h4>
                    <p className="text-gray-700 italic">
                      &ldquo;{currentEvaluation.comment}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Contenu de la conversation */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Prompt final
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <p className="text-indigo-900 whitespace-pre-wrap leading-relaxed">
                      {currentEvaluationConversation.versionFinale.promptFinal}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Réponse IA finale
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {
                        currentEvaluationConversation.versionFinale
                          .reponseIAFinale
                      }
                    </p>
                  </div>
                </div>

                {/* Note d'information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Star className="h-5 w-5 text-blue-500 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Mode révision
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Cette évaluation a déjà été soumise et ne peut plus être
                        modifiée. Vous pouvez uniquement consulter votre
                        évaluation précédente.
                      </p>
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
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Prompt final
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <p className="text-indigo-900 whitespace-pre-wrap leading-relaxed">
                      {currentConversation.versionFinale.promptFinal}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Réponse IA finale
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {currentConversation.versionFinale.reponseIAFinale}
                    </p>
                  </div>
                </div>

                {/* Vérifier si cette conversation n'a pas déjà été évaluée */}
                {!evaluations.some(
                  (evaluation) =>
                    evaluation.conversationId === currentConversation._id
                ) ? (
                  <div className="border-t border-gray-200 pt-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        Votre évaluation
                      </h3>

                      {/* Initialiser le formulaire si nécessaire */}
                      {(() => {
                        ensureFormExists(currentConversation._id);
                        return null;
                      })()}

                      {/* Note Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Note:{" "}
                          {evaluationForms[currentConversation._id]?.note || 5}
                          /10
                        </label>
                        <div className="relative">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={
                              evaluationForms[currentConversation._id]?.note ||
                              5
                            }
                            onChange={(e) =>
                              updateEvaluationForm(
                                currentConversation._id,
                                "note",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-600 mt-2 px-1">
                            <span className="text-red-600 font-medium">
                              1 - Très faible
                            </span>
                            <span className="text-yellow-600 font-medium">
                              5 - Moyen
                            </span>
                            <span className="text-green-600 font-medium">
                              10 - Excellent
                            </span>
                          </div>
                        </div>

                        {/* Indicateur visuel de la note */}
                        <div className="mt-4 p-3 rounded-lg bg-white border-2 border-gray-200">
                          <div className="flex items-center justify-center">
                            <div
                              className={`text-2xl font-bold px-4 py-2 rounded-full ${
                                (evaluationForms[currentConversation._id]
                                  ?.note || 5) >= 8
                                  ? "bg-green-100 text-green-800"
                                  : (evaluationForms[currentConversation._id]
                                      ?.note || 5) >= 6
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {evaluationForms[currentConversation._id]?.note ||
                                5}
                              /10
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Commentaire Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Commentaire détaillé{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            value={
                              evaluationForms[currentConversation._id]
                                ?.comment || ""
                            }
                            onChange={(e) =>
                              updateEvaluationForm(
                                currentConversation._id,
                                "comment",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                            rows={5}
                            placeholder="Expliquez votre évaluation : points forts, points faibles, suggestions d'amélioration..."
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                            {
                              (
                                evaluationForms[currentConversation._id]
                                  ?.comment || ""
                              ).length
                            }{" "}
                            caractères
                          </div>
                        </div>

                        {/* Suggestions d'aide */}
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700">
                            <strong>Suggestions :</strong> Évaluez la clarté du
                            prompt, la pertinence de la réponse, la créativité,
                            la précision technique, et l&apos;utilité pratique.
                          </p>
                        </div>
                      </div>

                      {/* Bouton de soumission */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() =>
                            submitEvaluation(currentConversation._id)
                          }
                          disabled={
                            !evaluationForms[
                              currentConversation._id
                            ]?.comment?.trim() ||
                            submittingEvals.has(currentConversation._id)
                          }
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        >
                          {submittingEvals.has(currentConversation._id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Soumission en cours...
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Soumettre l&apos;évaluation
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            updateEvaluationForm(
                              currentConversation._id,
                              "note",
                              5
                            );
                            updateEvaluationForm(
                              currentConversation._id,
                              "comment",
                              ""
                            );
                          }}
                          className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-8">
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-green-800">
                            Évaluation terminée
                          </h3>
                          <p className="text-sm text-green-600">
                            Vous avez déjà évalué cette conversation.
                          </p>
                        </div>
                      </div>
                    </div>
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
