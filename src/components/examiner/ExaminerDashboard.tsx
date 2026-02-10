"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/AuthContext";
import {
  Evaluation,
  EvaluationForm,
  ExaminerConversation,
} from "@/types/conversation";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
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
    background: #38bdf8;
    cursor: pointer;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #38bdf8;
    cursor: pointer;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"todo" | "done">(
    "todo"
  );
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
  const [mobileEvalPane, setMobileEvalPane] = useState<
    "conversation" | "evaluation"
  >("conversation");

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

  const pendingConversations = conversations.filter(
    (conv) =>
      conv.studentId &&
      !evaluations.some((evaluation) => evaluation.conversationId === conv._id)
  );
  const completedEvaluations = evaluations;
  const nextConversation = pendingConversations[0] || null;
  const recentEvaluations = completedEvaluations.slice(0, 4);
  const totalConversationsCount = conversations.filter(
    (conv) => conv.studentId
  ).length;
  const remainingConversationsCount = pendingConversations.length;
  const completedEvaluationsCount = completedEvaluations.length;
  const getNoteLabel = (note: number) => {
    if (note >= 9) return "Excellent";
    if (note >= 8) return "Très bon";
    if (note >= 6) return "Moyen";
    if (note >= 4) return "Faible";
    return "Très faible";
  };

  // Mode actuel : 'evaluation' pour évaluer, 'review' pour réviser
  const currentMode = selectedEvaluation ? "review" : "evaluation";

  useEffect(() => {
    if (selectedConversation || selectedEvaluation) {
      setMobileEvalPane("conversation");
    }
  }, [selectedConversation, selectedEvaluation]);

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
  }, [conversations, evaluations]);

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-lg text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (user.role !== "examiner") {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-50 to-stone-100">
        <div className="text-center p-8 bg-white/90 rounded-2xl shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)] border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Accès refusé
          </h1>
          <p className="text-slate-600 mb-4">
            Vous n&apos;avez pas les autorisations nécessaires pour accéder à
            cette page.
          </p>
          <p className="text-sm text-slate-500">
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-lg text-slate-600">Chargement...</div>
      </div>
    );
  }

  const isInEvaluationView = Boolean(currentConversation || selectedEvaluation);
  const isSidebarMinimized = isInEvaluationView && !isSidebarCollapsed;
  const sidebarWidthClass = isSidebarCollapsed
    ? "md:w-0 lg:w-0 md:opacity-0 md:pointer-events-none md:overflow-hidden md:border-r-0 md:shadow-none"
    : isSidebarMinimized
    ? "md:w-16 lg:w-16"
    : "md:w-80 lg:w-96";

  return (
    <div
      className="relative flex flex-col md:flex-row h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F6FA_100%)] overflow-hidden"
      suppressHydrationWarning
    >
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_70%_10%,rgba(56,189,248,0.08),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Languette sidebar (desktop) */}
      <button
        type="button"
        onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-50 items-center gap-2 rounded-r-2xl border border-[#D7E3F2]/80 bg-white/80 px-2.5 py-3 shadow-[0_10px_26px_-18px_rgba(15,23,42,0.25)] text-[#0F172A]/80 backdrop-blur-md transition-all duration-300 ease-in-out hover:-translate-y-[52%] hover:shadow-[0_12px_30px_-18px_rgba(56,189,248,0.35)] ${
          isSidebarCollapsed
            ? "left-0"
            : isSidebarMinimized
            ? "md:left-16 lg:left-16"
            : "md:left-80 lg:left-96"
        }`}
        aria-label={isSidebarCollapsed ? "Ouvrir les conversations" : "Fermer les conversations"}
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[0.2em] text-[#0F172A]/60">
          Conversations
        </span>
        <span className="h-5 w-5 rounded-full border border-cyan-400/40 bg-cyan-400/15 flex items-center justify-center text-cyan-600">
          {isSidebarCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      <div
        className={`hidden md:flex w-full ${sidebarWidthClass} bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.12),transparent_60%),linear-gradient(180deg,#F8FAFC_0%,#F1F6FB_100%)] text-[#0F172A] p-4 flex-col absolute md:relative inset-0 z-40 border-r border-[#D7E3F2]/80 rounded-r-2xl shadow-[0_12px_30px_-20px_rgba(15,23,42,0.12)] transition-all duration-300 ease-in-out`}
      >
        <div
          className={`flex items-center gap-0 -mt-6 mb-4 -ml-2 ${
            isSidebarCollapsed || isSidebarMinimized ? "justify-center" : ""
          }`}
        >
          <Link
            href="/"
            className="flex h-[80px] w-[80px] items-center justify-center overflow-visible"
            onClick={() => setSidebarOpen(false)}
          >
            <Image
              src="/ia-pau-logo.png?v=3"
              alt="Studia"
              width={90}
              height={90}
              className="h-[90px] w-[90px] object-contain"
              priority
            />
          </Link>
          {!isSidebarCollapsed && !isSidebarMinimized && (
            <span className="text-lg font-semibold text-[#0F172A] studia-font uppercase tracking-[0.08em] -ml-3">
              Studia
            </span>
          )}
        </div>

        {/* Tabs sidebar */}
        <div
          className={`mb-3 rounded-2xl border border-[#D7E3F2]/80 bg-white/90 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.2)] ${
            isSidebarCollapsed ? "p-2" : "p-2.5"
          }`}
        >
          <div className={`flex items-center ${isSidebarMinimized ? "flex-col gap-2" : "gap-2"}`}>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab("todo")}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeSidebarTab === "todo"
                      ? "bg-cyan-500/20 text-cyan-700 border border-cyan-500/40"
                      : "text-[#0F172A]/60 hover:text-[#0F172A]"
                  } ${isSidebarCollapsed || isSidebarMinimized ? "px-2" : ""}`}
                >
              <span className="inline-flex items-center gap-2 justify-center">
                <Star className="h-4 w-4" />
                {!isSidebarCollapsed && !isSidebarMinimized && "À évaluer"}
              </span>
            </button>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab("done")}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeSidebarTab === "done"
                      ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/40"
                      : "text-[#0F172A]/60 hover:text-[#0F172A]"
                  } ${isSidebarCollapsed || isSidebarMinimized ? "px-2" : ""}`}
                >
              <span className="inline-flex items-center gap-2 justify-center">
                <Sparkles className="h-4 w-4" />
                {!isSidebarCollapsed && !isSidebarMinimized && "Terminées"}
              </span>
            </button>
          </div>
        </div>

        {!isSidebarCollapsed && !isSidebarMinimized && (
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[62vh]">
            {activeSidebarTab === "todo" && (
              <>
                {pendingConversations.map((conv, index) => {
                  const isFinal = Boolean(conv.versionFinale?.reponseIAFinale);
                  const isActive = selectedConversation === conv._id;
                  return (
                    <div
                      key={conv._id}
                      className={`p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border bg-white shadow-[0_6px_16px_-12px_rgba(15,23,42,0.12)] ${
                        isActive
                          ? "border-cyan-400/60 bg-cyan-500/5 ring-1 ring-cyan-400/30"
                          : "border-[#D6E4F5] hover:border-cyan-400/40"
                      }`}
                      onClick={() => {
                        setSelectedConversation(conv._id);
                        setSelectedEvaluation(null);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[13px] text-[#0F172A]">
                          Conversation #{index + 1}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#0F172A]/45 mt-1">
                        {new Date(conv.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 border border-cyan-500/40">
                          À évaluer
                        </span>
                        {isFinal && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-200/35 text-[#0F172A]/65 border border-violet-300/40">
                            Version finale
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {pendingConversations.length === 0 && (
                  <div className="p-4 text-center text-[#0F172A]/50 text-xs bg-white/80 rounded-xl border border-[#E2E8F0]/80">
                    Aucune conversation à évaluer.
                  </div>
                )}
              </>
            )}

            {activeSidebarTab === "done" && (
              <>
                {completedEvaluations.map((evaluation, index) => (
                  <div
                    key={evaluation._id}
                    className={`p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border bg-white shadow-[0_6px_16px_-12px_rgba(15,23,42,0.12)] ${
                      selectedEvaluation === evaluation._id
                        ? "border-emerald-400/50 bg-emerald-500/5 ring-1 ring-emerald-400/30"
                        : "border-[#D6E4F5] hover:border-emerald-400/30"
                    }`}
                    onClick={() => {
                      setSelectedEvaluation(evaluation._id);
                      setSelectedConversation(null);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#0F172A]/70 font-medium">
                        Éval #{completedEvaluations.length - index}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/35">
                        Terminé
                      </span>
                    </div>
                    <div className="text-[10px] text-[#0F172A]/45 mt-1">
                      {new Date(evaluation.gradedAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                    <div className="mt-2 text-[10px] text-[#0F172A]/55 line-clamp-2 italic">
                      &ldquo;{evaluation.comment}&rdquo;
                    </div>
                  </div>
                ))}
                {completedEvaluations.length === 0 && (
                  <div className="p-4 text-center text-[#0F172A]/50 text-xs bg-white/80 rounded-xl border border-[#E2E8F0]/80">
                    Aucune évaluation effectuée
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!isSidebarCollapsed && isSidebarMinimized && (
          <>
            {/* Mobile: barre horizontale */}
            <div className="md:hidden -mx-2 px-2 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                {(activeSidebarTab === "todo" ? pendingConversations : completedEvaluations).map(
                  (item, index) => (
                    <button
                      key={item._id}
                      onClick={() => {
                        if (activeSidebarTab === "todo") {
                          setSelectedConversation(item._id);
                          setSelectedEvaluation(null);
                        } else {
                          setSelectedEvaluation(item._id);
                          setSelectedConversation(null);
                        }
                        setSidebarOpen(false);
                      }}
                      className={`h-8 w-8 shrink-0 rounded-full text-[11px] font-semibold border shadow-sm transition ${
                        activeSidebarTab === "todo"
                          ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                          : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                      }`}
                      aria-label="Conversation"
                    >
                      {index + 1}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Desktop: colonne */}
            <div className="hidden md:flex flex-col items-center gap-2 overflow-y-auto max-h-[62vh] pb-4">
              {(activeSidebarTab === "todo" ? pendingConversations : completedEvaluations).map(
                (item, index) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      if (activeSidebarTab === "todo") {
                        setSelectedConversation(item._id);
                        setSelectedEvaluation(null);
                      } else {
                        setSelectedEvaluation(item._id);
                        setSelectedConversation(null);
                      }
                      setSidebarOpen(false);
                    }}
                    className={`h-8 w-8 rounded-full text-[11px] font-semibold border shadow-sm transition ${
                      activeSidebarTab === "todo"
                        ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                        : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                    }`}
                    aria-label="Conversation"
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <header className="relative bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400/80 via-slate-600/60 to-slate-900/60" />
          <div className="flex flex-col gap-2 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href="/"
                  className="group flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-transparent hover:border-slate-300 hover:bg-white hover:text-slate-800 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.2)] transition"
                  aria-label="Retour à l’accueil"
                  title="Retour à l’accueil"
                >
                  <Home className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-[12px] font-semibold text-[#0F172A]/90 uppercase tracking-[0.08em] truncate">
                    Dashboard
                  </h1>
                  <p className="text-[9px] text-slate-500">
                    Évaluations
                  </p>
                </div>
              </div>
              <LogoutButton className="px-2 py-1 text-xs" />
            </div>

            <div className="flex justify-start">
              <div className="relative w-full">
                <label className="group relative flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.2)] backdrop-blur transition-all hover:border-cyan-400/40 hover:shadow-[0_14px_28px_-20px_rgba(56,189,248,0.25)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.35)] hackathon-pulse" />
                  <div className="text-left leading-tight min-w-0">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                      Hackathon
                    </div>
                    <div className="text-xs font-semibold text-[#0F172A] truncate">
                      {selectedHackathon === "all"
                        ? "Tous les hackathons"
                        : hackathons.find((h) => h._id === selectedHackathon)
                            ?.nom || "Hackathon"}
                    </div>
                  </div>
                  <span className="ml-auto text-slate-400 group-hover:text-slate-600 transition">
                    ▾
                  </span>
                  <select
                    value={selectedHackathon}
                    onChange={(e) => {
                      setSelectedHackathon(e.target.value);
                      setSelectedConversation(null);
                      setSelectedEvaluation(null);
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Sélectionner un hackathon actif"
                  >
                    <option value="all">Tous les hackathons</option>
                    {hackathons.map((hackathon) => (
                      <option key={hackathon._id} value={hackathon._id}>
                        {hackathon.nom}
                        {hackathon.statut && ` (${hackathon.statut})`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="hidden lg:grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            {/* Section titre et navigation */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-transparent hover:border-slate-300 hover:bg-white hover:text-slate-800 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.2)] transition"
                aria-label="Retour à l’accueil"
                title="Retour à l’accueil"
              >
                <Home className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-[#0F172A]/90 uppercase tracking-[0.12em]">
                  Tableau de bord
                </h1>
                <p className="text-[11px] text-slate-500">
                  Outil d’évaluation
                </p>
              </div>
            </div>

            {/* Section filtrage hackathon */}
            <div className="flex justify-start lg:justify-center">
              <div className="relative">
                <label className="group relative flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2.5 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.22)] backdrop-blur transition-all hover:border-cyan-400/40 hover:shadow-[0_16px_32px_-20px_rgba(56,189,248,0.28)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.35)] hackathon-pulse" />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Hackathon actif
                    </div>
                    <div className="text-sm font-semibold text-[#0F172A]">
                      {selectedHackathon === "all"
                        ? "Tous les hackathons"
                        : hackathons.find((h) => h._id === selectedHackathon)
                            ?.nom || "Hackathon"}
                    </div>
                  </div>
                  <span className="ml-1 text-slate-400 group-hover:text-slate-600 transition">
                    ▾
                  </span>
                  <select
                    value={selectedHackathon}
                    onChange={(e) => {
                      setSelectedHackathon(e.target.value);
                      setSelectedConversation(null);
                      setSelectedEvaluation(null);
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Sélectionner un hackathon actif"
                  >
                    <option value="all">Tous les hackathons</option>
                    {hackathons.map((hackathon) => (
                      <option key={hackathon._id} value={hackathon._id}>
                        {hackathon.nom}
                        {hackathon.statut && ` (${hackathon.statut})`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Section utilisateur */}
            <div className="flex items-center justify-start lg:justify-end gap-3">
              <div className="px-3 py-1.5 bg-white/90 text-slate-700 rounded-full border border-slate-200 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.2)] text-xs font-medium">
                Examinateur
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="relative flex-1 pl-24 pr-4 pt-4 pb-32 md:p-6 overflow-auto">
          {/* Mobile: rail gauche pour accès direct aux évaluations */}
          <div className="md:hidden fixed left-2 top-28 bottom-4 w-20">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.2)]">
              <button
                type="button"
                onClick={() => setActiveSidebarTab("todo")}
                className={`w-full rounded-xl px-2 py-1 text-[9px] font-semibold border leading-tight ${
                  activeSidebarTab === "todo"
                    ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                    : "bg-white/90 text-slate-600 border-slate-200"
                }`}
              >
                <span className="block">À</span>
                <span className="block">évaluer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebarTab("done")}
                className={`w-full rounded-xl px-2 py-1 text-[9px] font-semibold border leading-tight ${
                  activeSidebarTab === "done"
                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                    : "bg-white/90 text-slate-600 border-slate-200"
                }`}
              >
                <span className="block">Terminées</span>
              </button>
            </div>
            <div className="mt-3 flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100dvh-220px)] pb-4">
              {(activeSidebarTab === "todo" ? pendingConversations : completedEvaluations).map(
                (item, index) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      if (activeSidebarTab === "todo") {
                        setSelectedConversation(item._id);
                        setSelectedEvaluation(null);
                      } else {
                        setSelectedEvaluation(item._id);
                        setSelectedConversation(null);
                      }
                    }}
                    className={`h-8 w-8 rounded-full text-[11px] font-semibold border shadow-sm transition ${
                      activeSidebarTab === "todo"
                        ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                        : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                    }`}
                    aria-label="Évaluation"
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
            <div className="mt-1 text-[9px] text-slate-500 text-center pb-4">
              {activeSidebarTab === "todo" ? "À évaluer" : "Terminées"}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(56,189,248,0.035),transparent_70%)]" />
          <div className="relative mx-auto w-full max-w-[1200px] space-y-6">
          {/* Indicateur du hackathon sélectionné */}
          {(selectedHackathon !== "all" || selectedTache !== "all") && (
            <div className="mb-4 p-3 bg-white/80 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Filtrage actif :
                  </span>
                  {selectedHackathon !== "all" && (
                    <span className="text-sm font-bold text-slate-800">
                      {hackathons.find((h) => h._id === selectedHackathon)
                        ?.nom || selectedHackathon}
                    </span>
                  )}
                  {selectedTache !== "all" && (
                    <>
                      <span className="text-slate-500">→</span>
                      <Star className="h-3 w-3 text-cyan-600" />
                      <span className="text-sm font-bold text-slate-800">
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
                  className="text-slate-600 hover:text-slate-800 text-xs font-medium px-2 py-1 rounded border border-slate-300 hover:border-slate-400 transition-colors"
                >
                  Effacer tout
                </button>
              </div>
            </div>
          )}

          {!selectedConversation && !selectedEvaluation ? (
            <div className="space-y-6">
              <div className="md:hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-center shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">
                  <Star className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Choisis une évaluation
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Sélectionne un numéro dans la barre pour afficher les détails.
                </p>
              </div>

              <div className="hidden md:grid gap-6 lg:grid-cols-[2.2fr_1fr]">
                <div className="space-y-6">
                  {/* Résumé des évaluations */}
                  <div className="bg-white/90 rounded-2xl shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)] p-6 border border-slate-200/80">
                    <h2 className="text-xl font-semibold text-[#0F172A] mb-4 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-slate-700 rounded-lg flex items-center justify-center mr-3">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      Tableau de bord des évaluations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-1">
                          {remainingConversationsCount}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          À évaluer
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-1">
                          {completedEvaluationsCount}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Évaluations terminées
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-1">
                          {totalConversationsCount}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Conversations totales
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Progression des évaluations
                        </span>
                        <span className="text-sm text-slate-600">
                          {Math.round(
                            (completedEvaluationsCount /
                              Math.max(totalConversationsCount, 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/70 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-sky-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.round(
                              (completedEvaluationsCount /
                                Math.max(totalConversationsCount, 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* À évaluer maintenant */}
                  <div className="bg-white/90 rounded-2xl border border-slate-200/80 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-[#0F172A]">
                        À évaluer maintenant
                      </h3>
                      <span className="text-xs text-slate-500">
                        {pendingConversations.length} restantes
                      </span>
                    </div>
                    {nextConversation ? (
                      <div className="flex items-center justify-between rounded-2xl border border-cyan-400/50 bg-cyan-500/10 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">
                            Conversation #{pendingConversations.indexOf(nextConversation) + 1}
                          </p>
                          <p className="text-xs text-[#0F172A]/55 mt-1">
                            {new Date(nextConversation.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedConversation(nextConversation._id);
                            setSelectedEvaluation(null);
                          }}
                          className="px-4 py-2 rounded-full bg-[#0F172A] text-white text-xs font-semibold shadow-[0_12px_26px_-16px_rgba(2,6,23,0.6)] hover:bg-[#1E293B] transition"
                        >
                          Évaluer
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Aucune conversation à évaluer pour le moment.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/90 rounded-2xl border border-slate-200/80 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                    <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                      Prochaine évaluation
                    </h3>
                    {nextConversation ? (
                      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/5 px-4 py-3">
                        <p className="text-sm font-medium text-[#0F172A]">
                          Conversation #{pendingConversations.indexOf(nextConversation) + 1}
                        </p>
                        <p className="text-xs text-[#0F172A]/55 mt-1">
                          {new Date(nextConversation.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Rien à planifier.
                      </p>
                    )}
                  </div>

                  <div className="bg-white/90 rounded-2xl border border-slate-200/80 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                    <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                      Dernières terminées
                    </h3>
                    <div className="space-y-2">
                      {recentEvaluations.length > 0 ? (
                        recentEvaluations.map((evaluation) => (
                          <div
                            key={evaluation._id}
                            className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2"
                          >
                            <span className="text-xs text-[#0F172A]/70">
                              Éval #{evaluation._id.slice(-4).toUpperCase()}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600/80 border border-emerald-500/20">
                              Terminé
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">
                          Aucune évaluation terminée.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentMode === "review" &&
            currentEvaluation &&
            currentEvaluationConversation ? (
            // Mode révision d'une évaluation terminée
            <div className="space-y-6">
              <div className="md:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileEvalPane("conversation")}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold border ${
                    mobileEvalPane === "conversation"
                      ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                      : "bg-white/90 text-slate-600 border-slate-200"
                  }`}
                >
                  Conversation
                </button>
                <button
                  type="button"
                  onClick={() => setMobileEvalPane("evaluation")}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold border ${
                    mobileEvalPane === "evaluation"
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                      : "bg-white/90 text-slate-600 border-slate-200"
                  }`}
                >
                  Évaluation
                </button>
              </div>
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
                  className="hidden md:inline-flex px-3 py-1.5 text-xs sm:px-4 sm:py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Retour au tableau de bord
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Informations sur l'évaluation */}
                <div
                  className={`mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 ${
                    mobileEvalPane === "evaluation" ? "block" : "hidden md:block"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-lg font-medium text-emerald-800">
                      Votre évaluation
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          currentEvaluation.note >= 8
                            ? "bg-green-500 text-white"
                            : currentEvaluation.note >= 6
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {currentEvaluation.note}/10
                      </div>
                      <span className="text-emerald-600 text-xs">
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
                <div
                  className={`mb-6 ${
                    mobileEvalPane === "conversation"
                      ? "block"
                      : "hidden md:block"
                  }`}
                >
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Prompt final
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <p className="text-indigo-900 whitespace-pre-wrap leading-relaxed">
                      {currentEvaluationConversation.versionFinale.promptFinal}
                    </p>
                  </div>
                </div>

                <div
                  className={`mb-6 ${
                    mobileEvalPane === "conversation"
                      ? "block"
                      : "hidden md:block"
                  }`}
                >
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
                <div
                  className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${
                    mobileEvalPane === "evaluation" ? "block" : "hidden md:block"
                  }`}
                >
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
              <div className="md:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileEvalPane("conversation")}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold border ${
                    mobileEvalPane === "conversation"
                      ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                      : "bg-white/90 text-slate-600 border-slate-200"
                  }`}
                >
                  Conversation
                </button>
                <button
                  type="button"
                  onClick={() => setMobileEvalPane("evaluation")}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold border ${
                    mobileEvalPane === "evaluation"
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                      : "bg-white/90 text-slate-600 border-slate-200"
                  }`}
                >
                  Évaluation
                </button>
              </div>
              <h2 className="text-xl font-semibold text-[#0F172A]">
                Évaluation de la conversation
              </h2>

              <div className="bg-white/90 rounded-2xl shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)] p-6 border border-slate-200/80">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section
                    className={`rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.15)] ${
                      mobileEvalPane === "conversation"
                        ? "block"
                        : "hidden md:block"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        📝 Prompt final
                      </span>
                    </div>
                    <div className="rounded-xl bg-white/80 border border-slate-200/70 p-3 text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                      {currentConversation.versionFinale.promptFinal}
                    </div>
                  </section>

                  <section
                    className={`rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.15)] ${
                      mobileEvalPane === "conversation"
                        ? "block"
                        : "hidden md:block"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        🤖 Réponse IA finale
                      </span>
                    </div>
                    <div className="rounded-xl bg-white/80 border border-slate-200/70 p-3 text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                      {currentConversation.versionFinale.reponseIAFinale}
                    </div>
                  </section>
                </div>

                {/* Vérifier si cette conversation n'a pas déjà été évaluée */}
                {!evaluations.some(
                  (evaluation) =>
                    evaluation.conversationId === currentConversation._id
                ) ? (
                  <div
                    className={`mt-6 border-t border-dashed border-slate-300/80 pt-6 ${
                      mobileEvalPane === "evaluation"
                        ? "block max-h-[calc(100dvh-260px)] overflow-y-auto pr-1 pb-6"
                        : "hidden md:block"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Évaluation
                      </span>
                      <span className="text-xs text-slate-400">
                        J’ai lu → je note
                      </span>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.18)]">
                      <h3 className="text-base font-semibold mb-4 text-[#0F172A] flex items-center">
                        <Star className="h-5 w-5 text-cyan-500 mr-2" />
                        Votre évaluation
                      </h3>

                      {/* Initialiser le formulaire si nécessaire */}
                      {(() => {
                        ensureFormExists(currentConversation._id);
                        return null;
                      })()}

                      {/* Note Section */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-semibold text-[#0F172A]">
                            Note
                          </label>
                          <span className="text-sm font-semibold text-[#0F172A]">
                            {evaluationForms[currentConversation._id]?.note || 5}
                            /10 — {getNoteLabel(evaluationForms[currentConversation._id]?.note || 5)}
                          </span>
                        </div>
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
                            className="w-full h-3.5 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-full appearance-none cursor-pointer slider"
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
                        <div className="mt-4 flex items-center gap-3">
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                              (evaluationForms[currentConversation._id]?.note || 5) >= 8
                                ? "bg-green-100 text-green-800"
                              : (evaluationForms[currentConversation._id]?.note || 5) >= 6
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {evaluationForms[currentConversation._id]?.note || 5}/10
                          </span>
                          <span className="text-xs text-[#0F172A]/60">
                            {getNoteLabel(evaluationForms[currentConversation._id]?.note || 5)}
                          </span>
                        </div>
                      </div>

                      {/* Commentaire Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Commentaire détaillé{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-[#0F172A]/55 mb-3">
                          Donnez des éléments concrets : clarté du prompt, pertinence de la réponse,
                          points forts et améliorations possibles.
                        </p>
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
                            className="w-full px-4 py-3 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 resize-none transition-colors bg-white/95"
                            rows={5}
                            placeholder="Ex: Le prompt est clair, la réponse est pertinente mais manque d’exemples concrets. Suggestion : ..."
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

                        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                          <p className="text-xs text-[#0F172A]/60">
                            Suggestions : clarté, pertinence, précision technique, utilité pratique.
                          </p>
                        </div>
                      </div>

                      {/* Bouton de soumission */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                          className="flex-1 px-3 py-2 sm:px-6 sm:py-3.5 bg-[#0F172A] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
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
                          className="px-4 py-2.5 sm:py-3 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:ring-offset-2 transition-colors"
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-t border-gray-200 pt-8 ${
                      mobileEvalPane === "evaluation"
                        ? "block max-h-[calc(100dvh-260px)] overflow-y-auto pr-1 pb-6"
                        : "hidden md:block"
                    }`}
                  >
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
    </div>
  );
}
