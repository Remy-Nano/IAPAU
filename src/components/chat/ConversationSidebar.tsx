import axios from "axios";
// Importations simples pour gérer les dates
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ConversationItem } from "@/types/conversation";
import { format } from "date-fns";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

interface ConversationSidebarProps {
  studentId: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onConversationDeleted?: (conversationId: string) => void;
  className?: string;
  isMobileOpen?: boolean;
  hackathonId?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  tabLabel?: string;
}

const CONVERSATIONS_STYLES = {
  container: "flex-1 flex flex-col overflow-hidden",
  scrollContainer: "flex-1 overflow-y-auto pb-10",
  conversationsList: "space-y-3",
};

export function ConversationSidebar({
  studentId,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onConversationDeleted,
  className = "",
  isMobileOpen = false,
  hackathonId,
  isOpen = true,
  onToggle,
  tabLabel = "Conversations",
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    ConversationItem[]
  >([]);
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
      return "";
    }

    const content = conversation.messages[0].content;
    // Augmenter la longueur de l'aperçu maintenant que la sidebar est plus large
    if (content.toLowerCase() === "aucun contenu") return "";
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

  // Filtrer les conversations par hackathon
  useEffect(() => {
    if (hackathonId) {
      const filtered = conversations.filter(
        (conv) => conv.hackathonId === hackathonId
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [conversations, hackathonId]);

  // Récupérer les conversations de l'étudiant
  useEffect(() => {
    const fetchConversations = async () => {
      if (!studentId) {
        console.error("ID étudiant manquant");
        setError("ID étudiant manquant");
        setIsLoading(false);
        return;
      }

      console.log("Chargement des conversations pour studentId:", studentId);
      setIsLoading(true);
      setError(null);

      try {
        // Utiliser l'ID étudiant ou un ID de secours
        const effectiveStudentId = studentId || "6553f1ed4c3ef31ea8c03bc1";

        // Utiliser un chemin d'URL relatif
        console.log(
          `Appel API: /api/conversations/student/${effectiveStudentId}?includeMessages=true&includeStats=true`
        );
        const response = await axios.get(
          `/api/conversations/student/${effectiveStudentId}?includeMessages=true&includeStats=true`
        );

        if (response.data.success) {
          console.log("Conversations chargées:", response.data.conversations);

          // Si des conversations sont disponibles, les définir
          if (
            response.data.conversations &&
            Array.isArray(response.data.conversations) &&
            response.data.conversations.length > 0
          ) {
            setConversations(response.data.conversations);
          } else {
            console.log(
              "Aucune conversation trouvée pour cet ID étudiant, essai avec l'API générale"
            );
            // Essayer de récupérer toutes les conversations si aucune n'est trouvée pour l'ID spécifique
            const allResponse = await axios.get(`/api/conversations`);
            if (
              allResponse.data.success &&
              Array.isArray(allResponse.data.conversations) &&
              allResponse.data.conversations.length > 0
            ) {
              console.log(
                "Utilisation de toutes les conversations disponibles",
                allResponse.data.conversations.length
              );
              setConversations(allResponse.data.conversations);
            } else {
              console.log("Aucune conversation disponible");
              setConversations([]);
            }
          }
        } else {
          console.error("Erreur API:", response.data.message);
          setError(
            response.data.message ||
              "Erreur lors du chargement des conversations"
          );
        }
      } catch (error) {
        console.error("Erreur de chargement des conversations:", error);
        setError("Erreur lors du chargement des conversations");
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

  // Débogage des conversations
  useEffect(() => {
    console.log("Affichage des conversations:", {
      nombre: conversations.length,
      conversations: conversations.map((c) => ({
        id: c._id,
        titre: c.titreConversation,
      })),
      isLoading,
    });
  }, [conversations, isLoading]);

  // Déterminer la classe CSS pour afficher/masquer la sidebar sur mobile
  const mobileClass = isMobileOpen ? "translate-x-0" : "-translate-x-full";
  const desktopCollapsedClass = isOpen
    ? "md:w-80 lg:w-96 md:opacity-100 md:pointer-events-auto"
    : "md:w-0 md:opacity-0 md:pointer-events-none md:overflow-hidden md:border-r-0 md:shadow-none";

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

      {/* Languette (desktop) */}
      <button
        type="button"
        onClick={onToggle}
        className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 items-center gap-2 rounded-r-2xl border border-[#D7E3F2]/80 bg-white/80 px-2.5 py-3 shadow-[0_10px_26px_-18px_rgba(15,23,42,0.25)] text-[#0F172A]/80 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-40 hover:opacity-80" : "opacity-100 hover:opacity-100"
        } hover:-translate-y-[52%] hover:shadow-[0_12px_30px_-18px_rgba(56,189,248,0.35)] ${
          isOpen ? "md:left-80 lg:left-96" : "left-0"
        }`}
        aria-label={isOpen ? "Fermer les conversations" : "Ouvrir les conversations"}
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[0.2em] text-[#0F172A]/60">
          {tabLabel}
        </span>
        <span className="h-5 w-5 rounded-full border border-cyan-400/40 bg-cyan-400/15 flex items-center justify-center text-cyan-600">
          {isOpen ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      <aside
        className={`md:flex flex-col w-full p-5 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.12),transparent_60%),linear-gradient(180deg,#F8FAFC_0%,#F1F6FB_100%)] text-[#0F172A] h-full conversation-sidebar-container ${className} fixed md:relative left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${mobileClass} md:translate-x-0 border-r border-[#D7E3F2]/80 rounded-r-2xl shadow-[0_12px_30px_-20px_rgba(15,23,42,0.12)] ${desktopCollapsedClass}`}
        aria-label="Historique des conversations"
      >
        <div className="flex items-center justify-between mb-4 -mt-6 -ml-2">
          <div className="flex items-center space-x-0">
            <Image
              src="/ia-pau-logo.png?v=3"
              alt="Studia"
              width={90}
              height={90}
              className="h-[90px] w-[90px] object-contain"
              priority
            />
            <span className="text-lg font-semibold text-[#0F172A] studia-font uppercase tracking-[0.08em] -ml-3">
              Studia
            </span>
          </div>
        </div>

        <Button
          onClick={onNewConversation}
          className="mb-6 w-full bg-[#0F172A]/92 hover:bg-[#0F172A]/88 text-white flex items-center justify-center transition-all shadow-[0_8px_20px_-14px_rgba(15,23,42,0.3)] hover:shadow-[0_12px_26px_-16px_rgba(56,189,248,0.28)] border border-[#0F172A]/20 transform hover:-translate-y-0.5 duration-200 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-100 rounded-md p-3 text-sm mb-5 backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className={CONVERSATIONS_STYLES.container}>
          <ScrollArea className="h-full pr-3 -mr-2 conversation-history-scroll">
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
            ) : filteredConversations.length === 0 ? (
              <div className="text-[#0F172A]/70 text-center mt-6 p-8 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0]/80 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.12)]">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-70 text-cyan-500" />
                <p className="font-medium">
                  {hackathonId
                    ? "Aucune conversation trouvée pour ce hackathon."
                    : "Aucune conversation trouvée."}
                </p>
                <p className="text-sm mt-2 text-[#0F172A]/50">
                  <Button
                    onClick={onNewConversation}
                    variant="outline"
                    className="mx-auto mt-2 border-cyan-500/30 text-[#0F172A] hover:bg-cyan-500/10"
                  >
                    Nouvelle conversation
                  </Button>
                </p>
              </div>
            ) : (
              <div className={CONVERSATIONS_STYLES.conversationsList}>
                {/* Conversations triées par date (plus récentes en haut) */}
                {filteredConversations
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((conversation) => {
                    const isFinal = hasValidVersionFinale(conversation);
                    const isActive = selectedConversationId === conversation._id;
                    const cardClass = isActive
                      ? "border border-cyan-400/70 bg-cyan-500/5 ring-1 ring-cyan-400/40 shadow-[0_12px_26px_-18px_rgba(56,189,248,0.3)]"
                      : isFinal
                      ? "border border-amber-300/60 bg-amber-200/10 border-l-2 border-l-amber-400/70"
                      : "border border-[#D6E4F5] hover:border-cyan-400/50";
                    return (
                      <div
                        key={conversation._id}
                        className={`p-3 rounded-2xl cursor-pointer transition-all shadow-[0_4px_16px_-14px_rgba(15,23,42,0.12)] hover:shadow-[0_8px_20px_-16px_rgba(15,23,42,0.18)] group relative overflow-hidden bg-white ${cardClass} transform transition-transform duration-200 ${
                          isActive ? "scale-[1.02]" : "hover:scale-[1.02]"
                        }`}
                        onClick={() => onSelectConversation(conversation._id)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isActive}
                      >
                      {/* Effet brillant sur hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-md" />

                      <div className="flex justify-between items-start mb-2 relative">
                        <div className="flex items-center max-w-[80%]">
                          {hasValidVersionFinale(conversation) ? (
                            <span
                              title="Version finale soumise"
                              className="flex-shrink-0 mr-1.5 bg-amber-200/50 p-1 rounded-full border border-amber-300/50"
                            >
                              <Check className="h-3.5 w-3.5 text-[#0F172A]/70" />
                            </span>
                          ) : (
                            <span className="flex-shrink-0 mr-1.5 bg-cyan-500/15 p-1 rounded-full">
                              <MessageCircle className="h-3.5 w-3.5 text-cyan-500" />
                            </span>
                          )}
                          <h3 className="font-medium text-base leading-tight text-[#0F172A] line-clamp-2">
                            {formatConversationTitle(conversation)}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 z-10">
                          <button
                            onClick={(e) =>
                              handleDeleteClick(conversation._id, e)
                            }
                          className="text-[#0F172A]/50 transition-colors p-1 rounded-full hover:bg-cyan-500/10 hover:text-[#0F172A] flex-shrink-0"
                            aria-label="Supprimer cette conversation"
                            title="Supprimer cette conversation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full shrink-0 flex items-center bg-cyan-500/10 text-cyan-700 border border-cyan-500/20">
                          <Sparkles className="h-3 w-3 mr-1 opacity-70" />
                          {getActualModel(conversation)}
                        </span>
                        {isFinal && (
                          <span className="text-[11px] bg-amber-200/30 border border-amber-300/40 px-2 py-0.5 rounded-full text-[#0F172A]/70 font-medium shrink-0 flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Version finale
                          </span>
                        )}
                      </div>
                      {getPreview(conversation) && (
                        <p className="text-xs text-[#0F172A]/55 line-clamp-2 mb-2 leading-snug">
                          {getPreview(conversation)}
                        </p>
                      )}
                      <p className="text-xs text-[#0F172A]/45 mt-auto flex items-center">
                        <Clock className="h-3 w-3 mr-1 opacity-70" />
                        {formatDate(conversation.createdAt)}
                      </p>
                    </div>
                    );
                  })}
              </div>
            )}
          </ScrollArea>
        </div>
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
