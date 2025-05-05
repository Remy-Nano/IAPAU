import axios from "axios";
import { Menu, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Conversation } from "../../types";
import { LogoutButton } from "../auth/LogoutButton";
import { ChatInterface } from "../chat/ChatInterface";
import { ConversationSidebar } from "../chat/ConversationSidebar";

export const StudentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ID de l'étudiant fixe pour l'instant (sera remplacé par l'ID de l'utilisateur connecté)
  const studentId = "6553f1ed4c3ef31ea8c03bc1";

  // Charger une conversation spécifique
  const loadConversation = async (conversationId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/conversations/${conversationId}`
      );

      if (response.data.success) {
        setCurrentConversation(response.data.conversation);
        setSelectedConversationId(conversationId);
        // Fermer le sidebar sur mobile après la sélection
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

  // Créer une nouvelle conversation
  const handleNewConversation = () => {
    setCurrentConversation(null);
    setSelectedConversationId(null);
    // Fermer le sidebar sur mobile
    setSidebarOpen(false);
  };

  // Gérer la sélection d'une conversation
  const handleSelectConversation = (conversationId: string) => {
    if (selectedConversationId !== conversationId) {
      loadConversation(conversationId);
    }
  };

  // Gérer la création d'une nouvelle conversation
  const handleConversationCreated = (newConversationId: string) => {
    setSelectedConversationId(newConversationId);
  };

  // Gérer la suppression d'une conversation
  const handleConversationDeleted = (deletedConversationId: string) => {
    // Si la conversation supprimée est celle qui est actuellement affichée
    if (selectedConversationId === deletedConversationId) {
      setCurrentConversation(null);
      setSelectedConversationId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={
          sidebarOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"
        }
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar des conversations */}
      <ConversationSidebar
        studentId={studentId}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onConversationDeleted={handleConversationDeleted}
        isMobileOpen={sidebarOpen}
        className="shadow-lg"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - ajout de padding left sur mobile pour éviter le chevauchement avec le bouton */}
        <header className="bg-white shadow-sm p-4 pl-14 md:pl-4 flex flex-row justify-between items-center">
          <div className="px-4 py-2 bg-gray-200 rounded-lg">Hackathon IA</div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gray-200 rounded-lg">Étudiant</div>
            <LogoutButton />
          </div>
        </header>

        {/* Chat Interface with improved scrolling behavior */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <ChatInterface
            existingConversation={currentConversation}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
};
