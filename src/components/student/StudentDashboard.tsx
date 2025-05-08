"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Conversation } from "@/types";
import axios from "axios";
import { Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuth(); // récupération de l'utilisateur connecté

  // Utiliser l'ID de l'utilisateur connecté s'il est disponible
  const studentId = user?._id;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Log pour debug
    console.log("User in StudentDashboard:", user);
    console.log("Student ID used:", studentId);
  }, [user, studentId]);

  const loadConversation = async (conversationId: string) => {
    if (isLoading || !studentId) {
      if (!studentId) {
        toast.error("Utilisateur non connecté ou ID étudiant manquant");
      }
      return;
    }

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
      console.error("Erreur lors du chargement de la conversation:", error);
      toast.error("Erreur lors du chargement de la conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setSelectedConversationId(null);
    setSidebarOpen(false);
    // Ajouter un feedback visuel pour une meilleure expérience utilisateur
    toast.success("Nouvelle conversation démarrée");
  };

  const handleSelectConversation = (conversationId: string) => {
    if (selectedConversationId !== conversationId) {
      loadConversation(conversationId);
    }
  };

  const handleConversationCreated = (newConversationId: string) => {
    setSelectedConversationId(newConversationId);
    // Charger automatiquement la nouvelle conversation
    loadConversation(newConversationId);
    // Ajouter un feedback visuel
    toast.success("Nouvelle conversation créée");
  };

  const handleConversationDeleted = (deletedConversationId: string) => {
    if (selectedConversationId === deletedConversationId) {
      setCurrentConversation(null);
      setSelectedConversationId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={
          sidebarOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"
        }
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <ConversationSidebar
        studentId={studentId}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onConversationDeleted={handleConversationDeleted}
        isMobileOpen={sidebarOpen}
        className="shadow-lg"
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 pl-14 md:pl-4 flex justify-between items-center">
          <div className="px-4 py-2 bg-indigo-100 rounded-lg font-medium text-indigo-800">
            Hackathon IA
          </div>

          {/* Bouton flottant pour nouvelle conversation (visible sur mobile) */}
          <Button
            onClick={handleNewConversation}
            className="md:hidden fixed right-4 bottom-4 z-20 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-700/20 hover:shadow-indigo-700/40 flex items-center justify-center"
            aria-label="Nouvelle conversation"
          >
            <Plus size={20} />
          </Button>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-indigo-100 rounded-lg text-indigo-800">
              {user?.prenom ? `${user.prenom} ${user.nom}` : "Étudiant Test"}
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100/50 backdrop-blur-sm">
          <ChatInterface
            existingConversation={currentConversation}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
}
