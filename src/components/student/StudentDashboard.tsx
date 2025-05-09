"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { Conversation } from "@/types";
import { Hackathon } from "@/types/Hackathon";
import axios from "axios";
import { Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuth(); // récupération de l'utilisateur connecté

  // ID étudiant standard pour l'étudiant test
  const studentId = user?._id || "6553f1ed4c3ef31ea8c03bc1"; // Rétablir l'ID original de l'étudiant test
  // IDs par défaut pour tâche et groupe
  const defaultTacheId = "6553f1ed4c3ef31ea8c03bc3";
  const defaultGroupId = "6553f1ed4c3ef31ea8c03bc2";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Ajout d'un état pour forcer le rafraîchissement des conversations
  const [refreshConversations, setRefreshConversations] = useState(0);

  // États pour gérer les hackathons
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>("");
  const [loadingHackathons, setLoadingHackathons] = useState(false);

  // Forcer un rafraîchissement des conversations
  const forceRefreshConversations = () => {
    console.log("Forçage du rafraîchissement des conversations");
    setRefreshConversations((prev) => prev + 1);
  };

  // Charger la liste des hackathons disponibles
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoadingHackathons(true);
        const response = await axios.get("/api/hackathons");
        // Filtrer les hackathons actifs avec une condition plus souple
        const activeHackathons = response.data.filter((h: Hackathon) => {
          if (!h.statut) return false;
          const statut = h.statut.toLowerCase();
          return (
            statut.includes("en cours") ||
            statut.includes("actif") ||
            statut === "test"
          ); // Inclure aussi les hackathons de test
        });
        setHackathons(activeHackathons);

        // Si des hackathons sont disponibles, sélectionner le premier par défaut
        if (activeHackathons.length > 0) {
          setSelectedHackathon(activeHackathons[0]._id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des hackathons:", error);
        toast.error("Impossible de charger les hackathons disponibles");
      } finally {
        setLoadingHackathons(false);
      }
    };

    fetchHackathons();
  }, []);

  useEffect(() => {
    // Log pour debug
    console.log("User in StudentDashboard:", user);
    console.log("Student ID used:", studentId);

    // Forcer le rafraîchissement des conversations au chargement
    forceRefreshConversations();
  }, [user, studentId]);

  // Rafraîchir les conversations toutes les 30 secondes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      forceRefreshConversations();
    }, 30000); // 30 secondes

    return () => clearInterval(refreshInterval);
  }, []);

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

  const handleNewConversation = async () => {
    setCurrentConversation(null);
    setSelectedConversationId(null);
    setSidebarOpen(false);

    // Vérifier qu'un hackathon est sélectionné
    if (!selectedHackathon) {
      toast.error(
        "Veuillez sélectionner un hackathon avant de commencer une conversation"
      );
      return;
    }

    // Créer immédiatement une nouvelle conversation vide
    try {
      const conversationResponse = await axios.post("/api/conversations", {
        studentId,
        tacheId: defaultTacheId, // Ajouter l'ID de tâche par défaut
        groupId: defaultGroupId, // Ajouter l'ID de groupe par défaut
        hackathonId: selectedHackathon, // Ajouter l'ID du hackathon sélectionné
        titreConversation: `Conversation ${new Date().toLocaleDateString(
          "fr-FR"
        )} ${new Date().toLocaleTimeString("fr-FR")}`,
        promptType: "one shot",
        modelName: "openai",
      });

      const newConversationId = conversationResponse.data.conversation._id;

      // Utiliser la même fonction que lorsqu'une conversation est créée dans l'interface de chat
      handleConversationCreated(newConversationId);
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      toast.error("Erreur lors de la création de la conversation");
    }
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
    // Forcer le rafraîchissement des conversations dans la sidebar
    setRefreshConversations((prev) => prev + 1);
    // Message toast plus clair
    toast.success("Nouvelle conversation créée avec succès");
  };

  const handleConversationDeleted = (deletedConversationId: string) => {
    if (selectedConversationId === deletedConversationId) {
      setCurrentConversation(null);
      setSelectedConversationId(null);
    }
  };

  const handleHackathonChange = (hackathonId: string) => {
    setSelectedHackathon(hackathonId);
    // Réinitialiser la conversation en cours
    setCurrentConversation(null);
    setSelectedConversationId(null);
    // Forcer le rafraîchissement des conversations pour afficher celles du nouveau hackathon
    forceRefreshConversations();
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

      {/* Ajout d'un bouton de rafraîchissement */}
      <button
        className="hidden md:flex fixed top-4 right-20 z-50 p-2.5 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        onClick={forceRefreshConversations}
        aria-label="Rafraîchir les conversations"
        title="Rafraîchir les conversations"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
      </button>

      <ConversationSidebar
        studentId={studentId}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onConversationDeleted={handleConversationDeleted}
        isMobileOpen={sidebarOpen}
        className="shadow-lg"
        key={`sidebar-${refreshConversations}`} // Forcer le remontage du composant quand refreshConversations change
        hackathonId={selectedHackathon} // Passer l'ID du hackathon sélectionné
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 pl-14 md:pl-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Select
              value={selectedHackathon}
              onValueChange={handleHackathonChange}
              disabled={loadingHackathons}
            >
              <SelectTrigger className="w-[220px] bg-indigo-100 text-indigo-800 border-indigo-200 focus:ring-indigo-300">
                <SelectValue placeholder="Sélectionner un hackathon" />
              </SelectTrigger>
              <SelectContent>
                {hackathons.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun hackathon disponible
                  </SelectItem>
                ) : (
                  hackathons.map((hackathon) => (
                    <SelectItem key={hackathon._id} value={hackathon._id}>
                      {hackathon.nom}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
          {selectedHackathon ? (
            <ChatInterface
              existingConversation={currentConversation}
              onConversationCreated={handleConversationCreated}
              hackathonId={selectedHackathon}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                  Bienvenue dans le Hackathon IA
                </h2>
                <p className="text-gray-600 mb-6">
                  Veuillez sélectionner un hackathon dans la liste déroulante en
                  haut pour commencer à interagir avec l'IA.
                </p>
                {hackathons.length === 0 && !loadingHackathons && (
                  <p className="text-amber-600">
                    Aucun hackathon actif n'est disponible pour le moment.
                    Veuillez contacter votre administrateur.
                  </p>
                )}
                {loadingHackathons && (
                  <p className="text-indigo-600">
                    Chargement des hackathons disponibles...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
