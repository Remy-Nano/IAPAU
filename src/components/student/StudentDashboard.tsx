"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { useAuth } from "@/context/AuthContext";
import { Conversation } from "@/types";
import axios from "axios";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth(); // récupération de l'utilisateur connecté

  // Utiliser user._id, user.id, ou une valeur par défaut
  const studentId = user?._id || user?.id || "6553f1ed4c3ef31ea8c03bc1";

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
    if (isLoading || !studentId) return;
    setIsLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/conversations/${conversationId}`
      );

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
  };

  const handleSelectConversation = (conversationId: string) => {
    if (selectedConversationId !== conversationId) {
      loadConversation(conversationId);
    }
  };

  const handleConversationCreated = (newConversationId: string) => {
    setSelectedConversationId(newConversationId);
  };

  const handleConversationDeleted = (deletedConversationId: string) => {
    if (selectedConversationId === deletedConversationId) {
      setCurrentConversation(null);
      setSelectedConversationId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm p-4 pl-14 md:pl-4 flex justify-between items-center">
          <div className="px-4 py-2 bg-gray-200 rounded-lg">Hackathon IA</div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gray-200 rounded-lg">
              {user?.prenom ? `${user.prenom} ${user.nom}` : "Étudiant"}
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <ChatInterface
            existingConversation={currentConversation}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
}
