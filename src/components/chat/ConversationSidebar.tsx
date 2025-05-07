import axios from "axios";
// Importations simples pour gérer les dates
import { format } from "date-fns";
import {
  Brain,
  Check,
  Clock,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

// Type pour les données de conversation dans la sidebar
interface ConversationItem {
  _id: string;
  modelName: string;
  titreConversation: string;
  createdAt: string;
  messages?: {
    content: string;
    role: string;
    modelUsed?: string;
  }[];
  versionFinale?: {
    promptFinal: string;
    reponseIAFinale: string;
    soumisLe: string;
  };
  statistiquesIA?: {
    modelUtilise: string;
  };
}

interface ConversationSidebarProps {
  studentId: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onConversationDeleted?: (conversationId: string) => void;
  className?: string;
  isMobileOpen?: boolean;
}

export function ConversationSidebar({
  studentId,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onConversationDeleted,
  className = "",
  isMobileOpen = false,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fonction pour formater la date en format relatif (ex: "il y a 2 heures")
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();

      // Calcul de la différence en millisecondes
      const diffMs = now.getTime() - date.getTime();

      // Conversion en jours/heures/minutes
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      // Format relatif simple
      if (diffDays > 30) {
        return format(date, "dd/MM/yyyy");
      } else if (diffDays > 0) {
        return diffDays === 1 ? "hier" : `il y a ${diffDays} jours`;
      } else if (diffHours > 0) {
        return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
      } else if (diffMinutes > 0) {
        return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
      } else {
        return "à l'instant";
      }
    } catch {
      return "Date inconnue";
    }
  };

  // Extraire un aperçu du premier message (s'il existe)
  const getPreview = (conversation: ConversationItem) => {
    if (
      !conversation.messages ||
      conversation.messages.length === 0 ||
      !conversation.messages[0].content
    ) {
      return "Aucun contenu";
    }

    const content = conversation.messages[0].content;
    // Augmenter la longueur de l'aperçu maintenant que la sidebar est plus large
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  // Vérifier si une conversation a une version finale valide
  const hasValidVersionFinale = (conversation: ConversationItem): boolean => {
    return Boolean(
      conversation.versionFinale &&
        conversation.versionFinale.promptFinal &&
        conversation.versionFinale.reponseIAFinale
    );
  };

  // Ajouter une fonction pour déterminer le modèle réellement utilisé
  const getActualModel = (conversation: ConversationItem): string => {
    // Si la conversation a des statistiques IA, utiliser le modèle réellement utilisé
    if (conversation.statistiquesIA?.modelUtilise) {
      return conversation.statistiquesIA.modelUtilise;
    }

    // Si la conversation a une version finale, vérifier si le message de réponse contient l'information du modèle
    if (conversation.messages && conversation.messages.length > 0) {
      // Chercher le dernier message AI qui pourrait avoir un attribut modelUsed
      for (let i = conversation.messages.length - 1; i >= 0; i--) {
        const message = conversation.messages[i];
        if (message.role === "ai" && message.modelUsed) {
          return message.modelUsed;
        }
      }
    }

    // Par défaut, utiliser le modelName de la conversation
    return conversation.modelName || "IA";
  };

  // Fonction pour obtenir les styles CSS du badge du modèle
  const getModelBadgeStyle = (modelName: string): string => {
    const model = modelName.toLowerCase();

    if (model.includes("openai") || model === "openai") {
      return "bg-green-700 text-white";
    } else if (model.includes("mistral") || model === "mistral") {
      return "bg-blue-700 text-white";
    }

    return "bg-gray-700 text-gray-300";
  };

  // Fonction pour formater le titre de la conversation
  const formatConversationTitle = (conversation: ConversationItem): string => {
    // Si la conversation a déjà un titre personnalisé, l'utiliser
    if (
      conversation.titreConversation &&
      conversation.titreConversation !== "Sans titre"
    ) {
      return conversation.titreConversation;
    }

    // Sinon, créer un titre avec date et heure
    try {
      const date = new Date(conversation.createdAt);
      const formattedDate = date.toLocaleDateString("fr-FR");
      const formattedTime = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return `Conversation ${formattedDate} ${formattedTime}`;
    } catch {
      return "Nouvelle conversation";
    }
  };

  // Récupérer les conversations de l'étudiant
  useEffect(() => {
    const fetchConversations = async () => {
      if (!studentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Utiliser un chemin d'URL relatif
        const response = await axios.get(
          `/api/conversations/student/${studentId}?includeMessages=true&includeStats=true`
        );

        if (response.data.success) {
          console.log("Conversations chargées:", response.data.conversations);

          // Si des conversations sont disponibles, les définir
          if (
            response.data.conversations &&
            response.data.conversations.length > 0
          ) {
            setConversations(response.data.conversations);
          } else {
            // Essayer de récupérer toutes les conversations si aucune n'est trouvée pour l'ID spécifique
            const allResponse = await axios.get(`/api/conversations`);
            if (
              allResponse.data.success &&
              allResponse.data.conversations?.length > 0
            ) {
              console.log(
                "Utilisation de toutes les conversations disponibles"
              );
              setConversations(allResponse.data.conversations);
            } else {
              setError("Aucune conversation disponible");
            }
          }
        } else {
          setError("Impossible de charger les conversations");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des conversations:", err);
        setError("Erreur de connexion au serveur");

        // En cas d'erreur, essayer de récupérer toutes les conversations
        try {
          const fallbackResponse = await axios.get(`/api/conversations`);
          if (
            fallbackResponse.data.success &&
            fallbackResponse.data.conversations?.length > 0
          ) {
            console.log(
              "Fallback: Utilisation de toutes les conversations disponibles"
            );
            setConversations(fallbackResponse.data.conversations);
            setError(null);
          }
        } catch (fallbackErr) {
          console.error("Erreur de fallback:", fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [studentId]);

  // Mettre à jour l'affichage du modèle dans les conversations
  useEffect(() => {
    if (conversations.length > 0) {
      console.log("Modèles détectés dans les conversations:");
      conversations.forEach((conversation) => {
        const actualModel = getActualModel(conversation);
        console.log(
          `Conversation ${conversation._id} - Modèle affiché: ${actualModel} (original: ${conversation.modelName})`
        );

        // Log des statistiques IA si disponibles
        if (conversation.statistiquesIA?.modelUtilise) {
          console.log(
            `  - statistiquesIA.modelUtilise: ${conversation.statistiquesIA.modelUtilise}`
          );
        }
      });
    }
  }, [conversations]);

  // Déterminer la classe CSS pour afficher/masquer la sidebar sur mobile
  const mobileClass = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  // Supprimer une conversation
  const deleteConversation = async (conversationId: string) => {
    setIsDeletingConversation(true);
    try {
      // Utiliser un chemin d'URL relatif
      const response = await axios.delete(
        `/api/conversations/${conversationId}`
      );

      if (response.data.success) {
        // Supprimer la conversation de la liste locale
        setConversations(
          conversations.filter((conv) => conv._id !== conversationId)
        );

        // Notifier le parent de la suppression
        if (onConversationDeleted) {
          onConversationDeleted(conversationId);
        }

        // Réinitialiser si la conversation supprimée était sélectionnée
        if (selectedConversationId === conversationId) {
          onNewConversation();
        }

        toast.success("Conversation supprimée avec succès");
      } else {
        toast.error("Erreur lors de la suppression de la conversation");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      toast.error("Impossible de supprimer la conversation");
    } finally {
      setIsDeletingConversation(false);
      setConversationToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation
  const handleDeleteClick = (
    conversationId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation(); // Empêcher la sélection de la conversation
    setConversationToDelete(conversationId);
    setShowDeleteDialog(true);
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
    }
  };

  return (
    <>
      {/* Overlay semi-transparent pour fermer la sidebar sur mobile */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => onNewConversation()} // Utiliser onNewConversation comme handler pour fermer la sidebar
        />
      )}

      <aside
        className={`md:flex flex-col w-full md:w-80 lg:w-96 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 h-full overflow-hidden ${className} fixed md:relative left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${mobileClass} md:translate-x-0 border-r border-indigo-500/20`}
        aria-label="Historique des conversations"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-indigo-400" />
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Conversations
            </h2>
          </div>
        </div>

        <Button
          onClick={onNewConversation}
          className="mb-5 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center transition-all shadow-lg shadow-indigo-700/20 hover:shadow-indigo-700/40 transform hover:scale-[1.02] duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-100 rounded-md p-3 text-sm mb-5 backdrop-blur-sm">
            {error}
          </div>
        )}

        <ScrollArea className="flex-1 pr-3 -mr-2 pb-5 conversation-history-scroll">
          {isLoading ? (
            // Affichage d'un skeleton loader pendant le chargement
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-800/40 rounded-lg backdrop-blur-sm"
                  >
                    <Skeleton className="h-5 w-3/4 bg-gray-700 mb-3" />
                    <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
                    <Skeleton className="h-4 w-2/3 bg-gray-700" />
                  </div>
                ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-gray-400 text-center mt-6 p-8 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50 text-indigo-400" />
              <p className="font-medium">Aucune conversation</p>
              <p className="text-sm mt-2 text-gray-500">
                Cliquez sur &quot;Nouvelle conversation&quot; pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md group relative overflow-hidden ${
                    selectedConversationId === conversation._id
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-700/20"
                      : hasValidVersionFinale(conversation)
                      ? "bg-gradient-to-r from-green-600/20 to-green-500/10 border-l-4 border-green-500/70 dark:bg-green-900/20"
                      : "bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700/50 hover:border-indigo-500/30"
                  } transform transition-transform duration-200 ${
                    selectedConversationId === conversation._id
                      ? "scale-[1.02]"
                      : "hover:scale-[1.02]"
                  }`}
                  onClick={() => onSelectConversation(conversation._id)}
                  role="button"
                  tabIndex={0}
                  aria-selected={selectedConversationId === conversation._id}
                >
                  {/* Effet brillant sur hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/5 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-md" />

                  <div className="flex justify-between items-start mb-2 relative">
                    <div className="flex items-center max-w-[80%]">
                      {hasValidVersionFinale(conversation) ? (
                        <span
                          title="Version finale soumise"
                          className="flex-shrink-0 mr-1.5 bg-green-500/20 p-1 rounded-full"
                        >
                          <Check className="h-3.5 w-3.5 text-green-300" />
                        </span>
                      ) : (
                        <span className="flex-shrink-0 mr-1.5 bg-indigo-500/20 p-1 rounded-full">
                          <MessageCircle className="h-3.5 w-3.5 text-indigo-300" />
                        </span>
                      )}
                      <h3
                        className={`font-medium text-base truncate leading-tight ${
                          hasValidVersionFinale(conversation) &&
                          !(selectedConversationId === conversation._id)
                            ? "text-green-200"
                            : ""
                        }`}
                      >
                        {formatConversationTitle(conversation)}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 z-10">
                      <button
                        onClick={(e) => handleDeleteClick(conversation._id, e)}
                        className="text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/20 hover:text-red-300 flex-shrink-0"
                        aria-label="Supprimer cette conversation"
                        title="Supprimer cette conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 flex items-center ${getModelBadgeStyle(
                        getActualModel(conversation)
                      )}`}
                    >
                      <Sparkles className="h-3 w-3 mr-1 opacity-70" />
                      {getActualModel(conversation)}
                    </span>
                    {hasValidVersionFinale(conversation) && (
                      <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 px-2 py-0.5 rounded-full text-white font-medium shrink-0 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Version finale
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2 leading-snug">
                    {getPreview(conversation)}
                  </p>
                  <p className="text-xs text-gray-400 mt-auto flex items-center">
                    <Clock className="h-3 w-3 mr-1 opacity-70" />
                    {formatDate(conversation.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Boîte de dialogue de confirmation de suppression */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-gray-800 text-white border border-gray-700 rounded-xl backdrop-blur-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la conversation</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Êtes-vous sûr de vouloir supprimer cette conversation ? Cette
                action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-gray-700 text-white hover:bg-gray-600"
                disabled={isDeletingConversation}
              >
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
                disabled={isDeletingConversation}
              >
                {isDeletingConversation ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </aside>
    </>
  );
}
