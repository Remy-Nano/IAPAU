"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { FixedPromptInput } from "@/components/chat/FixedPromptInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";            // <== 🔥 AJOUT IMPORTANT
import { useAuth } from "@/context/AuthContext";
import { Conversation } from "@/types";
import { Hackathon } from "@/types/Hackathon";
import axios from "axios";
import { Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuth();

  const studentId = user?._id || null;
  const defaultTacheId = "6553f1ed4c3ef31ea8c03bc3";
  const defaultGroupId = "6553f1ed4c3ef31ea8c03bc2";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshConversations, setRefreshConversations] = useState(0);

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>("");
  const [loadingHackathons, setLoadingHackathons] = useState(false);

  const [isPromptLoading, setIsPromptLoading] = useState(false);

  const forceRefreshConversations = () => {
    setRefreshConversations((prev) => prev + 1);
  };

  // Charger hackathons
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoadingHackathons(true);
        const response = await axios.get("/api/hackathons");

        const active = response.data.filter((h: Hackathon) => {
          if (!h.statut) return false;
          const s = h.statut.toLowerCase();
          return (
            s.includes("en cours") ||
            s.includes("actif") ||
            s === "test"
          );
        });

        setHackathons(active);
        if (active.length > 0) setSelectedHackathon(active[0]._id);
      } catch (error) {
        toast.error("Impossible de charger les hackathons");
      } finally {
        setLoadingHackathons(false);
      }
    };

    fetchHackathons();
  }, []);

  useEffect(() => {
    forceRefreshConversations();
  }, [user, studentId]);

  useEffect(() => {
    const interval = setInterval(() => {
      forceRefreshConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadConversation = async (conversationId: string) => {
    if (isLoading || !studentId) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);

      if (response.data.conversation) {
        setCurrentConversation(response.data.conversation);
        setSelectedConversationId(conversationId);
        setSidebarOpen(false);
      } else {
        toast.error("Impossible de charger la conversation");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    setCurrentConversation(null);
    setSelectedConversationId(null);
    setSidebarOpen(false);

    if (!selectedHackathon) {
      toast.error("Sélectionnez un hackathon avant de commencer");
      return;
    }

    try {
      const conversationResponse = await axios.post("/api/conversations", {
        studentId: studentId!,
        tacheId: defaultTacheId,
        groupId: defaultGroupId,
        hackathonId: selectedHackathon,
        titreConversation: `Conversation ${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR")}`,
        promptType: "one shot",
        modelName: "openai",
      });

      const newId = conversationResponse.data.conversation._id;

      handleConversationCreated(newId);
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleSelectConversation = (id: string) => {
    if (selectedConversationId !== id) loadConversation(id);
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id);
    loadConversation(id);
    setRefreshConversations((prev) => prev + 1);
    toast.success("Nouvelle conversation créée");
  };

  const handleConversationDeleted = (id: string) => {
    if (selectedConversationId === id) {
      setCurrentConversation(null);
      setSelectedConversationId(null);
    }
  };

  const handleHackathonChange = (id: string) => {
    setSelectedHackathon(id);
    setCurrentConversation(null);
    setSelectedConversationId(null);
    forceRefreshConversations();
  };

  const handleSendPrompt = async (prompt: string) => {
    if (!selectedHackathon) return toast.error("Sélectionnez un hackathon");
    if (!selectedConversationId) return toast.error("Sélectionnez une conversation");

    setIsPromptLoading(true);

    try {
      await axios.post(`/api/conversations/${selectedConversationId}/ai-response`, {
        prompt,
        modelName: "openai",
        maxTokens: 512,
        temperature: 0.7,
      });

      await loadConversation(selectedConversationId);

      toast.success("Message envoyé !");
    } catch (error) {
      toast.error("Erreur d’envoi");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const hasVersionFinale = Boolean(
    currentConversation?.versionFinale?.promptFinal &&
    currentConversation?.versionFinale?.reponseIAFinale
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      
      {/* Bouton menu mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-indigo-600 text-white shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* SIDEBAR */}
      {studentId ? (
        <ConversationSidebar
          studentId={studentId}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onConversationDeleted={handleConversationDeleted}
          isMobileOpen={sidebarOpen}
          className="shadow-lg"
          key={`sidebar-${refreshConversations}`}
          hackathonId={selectedHackathon}
        />
      ) : (
        <div className="w-80 bg-gray-800 text-white p-4 flex items-center justify-center">
          <LogoutButton />
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 pl-14 md:pl-4 flex justify-between items-center">

          <div className="flex items-center space-x-4">
            <Select value={selectedHackathon} onValueChange={handleHackathonChange} disabled={loadingHackathons}>
              <SelectTrigger className="w-[220px] bg-indigo-100 text-indigo-800 border-indigo-200">
                <SelectValue placeholder="Sélectionner un hackathon" />
              </SelectTrigger>
              <SelectContent>
                {hackathons.length === 0 ? (
                  <SelectItem value="none" disabled>Aucun hackathon dispo</SelectItem>
                ) : (
                  hackathons.map((h) => (
                    <SelectItem key={h._id} value={h._id}>{h.nom}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ⭐⭐⭐ AJOUT DU BOUTON MES RÉSULTATS ⭐⭐⭐ */}
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/student/results"
              className="px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            >
              Mes résultats
            </Link>

            <div className="px-4 py-2 bg-indigo-100 rounded-lg text-indigo-800">
              {user?.prenom ? `${user.prenom} ${user.nom}` : "Étudiant Test"}
            </div>

            <LogoutButton />
          </div>
          {/* ⭐⭐⭐ FIN AJOUT ⭐⭐⭐ */}

        </header>

        {/* CONTENU */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-56">

          {selectedHackathon ? (
            hasVersionFinale ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border-l-4 border-emerald-500">
                  <h2 className="text-2xl font-bold text-emerald-700 mb-4">
                    Version finale soumise
                  </h2>
                  <button
                    onClick={() => window.open(`/version-finale/${selectedConversationId}`, "_blank")}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
                  >
                    Voir la version finale
                  </button>
                </div>
              </div>
            ) : (
              <ChatInterface existingConversation={currentConversation} />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                  Bienvenue dans le Hackathon IA
                </h2>
                <p className="text-gray-600">Sélectionnez un hackathon pour commencer.</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* INPUT FIXE EN BAS */}
      {selectedHackathon && selectedConversationId && !hasVersionFinale && (
        <FixedPromptInput onSendPrompt={handleSendPrompt} isLoading={isPromptLoading} />
      )}
    </div>
  );
}
