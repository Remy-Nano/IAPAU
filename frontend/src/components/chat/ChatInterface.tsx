import axios from "axios";
import { Check, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Conversation, Message } from "../../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ConversationStats } from "./ConversationStats";
import { ModelSelect } from "./ModelSelect";
import { PromptInput } from "./PromptInput";
import { PromptTypeSelect } from "./PromptTypeSelect";
import { ResponseList } from "./ResponseList";
import { SubmitFinalButton } from "./SubmitFinalButton";

interface ChatData {
  titreConversation: string;
  promptType: "one shot" | "contextuel";
  modelName: string;
  prompt: string;
  selectedPair: number | null;
}

interface ChatInterfaceProps {
  existingConversation?: Conversation | null;
  onConversationCreated?: (conversationId: string) => void;
}

/**
 * Interface principale de chat permettant d'interagir avec différentes IA
 */
export function ChatInterface({
  existingConversation = null,
  onConversationCreated,
}: ChatInterfaceProps) {
  // Récupération des paramètres d'URL avec des valeurs par défaut
  const {
    studentId = "6553f1ed4c3ef31ea8c03bc1",
    groupId = "6553f1ed4c3ef31ea8c03bc2",
    tacheId = "6553f1ed4c3ef31ea8c03bc3",
  } = useParams<{
    studentId?: string;
    groupId?: string;
    tacheId?: string;
  }>();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationData, setConversationData] = useState<Conversation | null>(
    null
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedFinalPrompt, setSelectedFinalPrompt] = useState<string>("");
  const [selectedFinalResponse, setSelectedFinalResponse] =
    useState<string>("");
  // Stocker les modèles utilisés pour chaque message
  const [messageModels, setMessageModels] = useState<Record<number, string>>(
    {}
  );
  // État pour vérifier si la conversation a une version finale
  const hasVersionFinale = Boolean(
    conversationData?.versionFinale &&
      conversationData.versionFinale.promptFinal &&
      conversationData.versionFinale.reponseIAFinale
  );

  // Références pour les formulaires
  const promptFormRef = useRef<HTMLFormElement>(null);
  const finalFormRef = useRef<HTMLFormElement>(null);

  const methods = useForm<ChatData>({
    defaultValues: {
      titreConversation: "",
      promptType: "one shot",
      modelName: "openai",
      prompt: "",
      selectedPair: null,
    },
  });

  const currentModelName = methods.watch("modelName");
  const selectedPair = methods.watch("selectedPair");

  // Log de débogage pour voir l'état actuel de la sélection
  console.log("État actuel:", {
    selectedPair,
    conversationId,
    messagesCount: messages.length,
    messageModels,
  });

  // Initialiser le composant avec la conversation existante si elle est fournie
  useEffect(() => {
    if (existingConversation) {
      setConversationId(existingConversation._id);
      setMessages(existingConversation.messages);
      setConversationData(existingConversation);

      // Initialiser les modèles de messages
      const newMessageModels: Record<number, string> = {};
      existingConversation.messages.forEach((message, index) => {
        if (message.role === "ai") {
          newMessageModels[index] = existingConversation.modelName;
        }
      });
      setMessageModels(newMessageModels);

      // Réinitialiser le formulaire avec les valeurs de la conversation
      methods.reset({
        titreConversation: existingConversation.titreConversation,
        promptType: existingConversation.promptType,
        modelName: existingConversation.modelName,
        prompt: "",
        selectedPair: null,
      });
    } else {
      // Réinitialiser l'état pour une nouvelle conversation
      setConversationId(null);
      setMessages([]);
      setConversationData(null);
      setMessageModels({});

      // Réinitialiser le formulaire pour une nouvelle conversation
      methods.reset({
        titreConversation: "",
        promptType: "one shot",
        modelName: "openai",
        prompt: "",
        selectedPair: null,
      });
    }
  }, [existingConversation, methods]);

  /**
   * Gère l'envoi d'un nouveau prompt à l'IA
   */
  const handleSendPrompt = async (data: ChatData) => {
    // Empêcher l'envoi si un prompt vide
    if (!data.prompt || data.prompt.trim() === "") {
      toast.error("Veuillez entrer un prompt avant d'envoyer");
      return;
    }

    // Empêcher l'envoi si la conversation a une version finale
    if (hasVersionFinale) {
      toast.error(
        "Cette conversation a déjà été soumise en version finale et ne peut plus être modifiée"
      );
      return;
    }

    try {
      setIsLoading(true);

      if (!conversationId) {
        // Création d'une nouvelle conversation
        console.log("Création d'une nouvelle conversation avec:", {
          studentId,
          groupId,
          tacheId,
          modelName: data.modelName,
          titreConversation:
            data.titreConversation ||
            `Conversation ${new Date().toLocaleString()}`,
          promptType: data.promptType,
          prompt: data.prompt,
        });

        const response = await axios.post(
          "http://localhost:3000/api/conversations",
          {
            studentId,
            groupId,
            tacheId,
            modelName: data.modelName,
            titreConversation:
              data.titreConversation ||
              `Conversation ${new Date().toLocaleString()}`,
            promptType: data.promptType,
            prompt: data.prompt,
          }
        );

        console.log("Nouvelle conversation créée:", response.data);
        const newConversationId = response.data.conversation._id;
        setConversationId(newConversationId);
        setMessages(response.data.conversation.messages);
        setConversationData(response.data.conversation);

        // Mémoriser le modèle pour le premier message IA
        const newMessageModels: Record<number, string> = {};
        // L'indice 1 correspond à la réponse IA (indice impair)
        newMessageModels[1] = data.modelName;
        setMessageModels(newMessageModels);

        // Notifier le parent de la création de la nouvelle conversation
        if (onConversationCreated) {
          onConversationCreated(newConversationId);
        }

        toast.success("Nouvelle conversation créée avec succès");
      } else {
        // Ajout d'un message à une conversation existante
        console.log("Ajout d'un message:", {
          conversationId,
          prompt: data.prompt,
          modelName: data.modelName,
        });

        const response = await axios.post(
          `http://localhost:3000/api/conversations/${conversationId}/ai-response`,
          {
            prompt: data.prompt,
            modelName: data.modelName,
          }
        );

        console.log("Réponse d'ajout de message:", response.data);
        setMessages(response.data.conversation.messages);
        setConversationData(response.data.conversation);

        // Mémoriser le modèle pour les nouveaux messages
        const newMessageModels = { ...messageModels };
        // Les 2 nouveaux messages sont aux indices messages.length-2 et messages.length-1
        // On associe seulement la réponse IA au modèle actuel (indice impair)
        const responseIndex = response.data.conversation.messages.length - 1;
        newMessageModels[responseIndex] = data.modelName;
        setMessageModels(newMessageModels);

        toast.success("Réponse reçue avec succès");
      }

      // Réinitialiser le champ de prompt
      methods.reset({
        ...methods.getValues(),
        prompt: "",
      });
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du prompt:", error);
      // Affichage plus détaillé de l'erreur
      if (axios.isAxiosError(error) && error.response) {
        console.error("Données de l'erreur:", error.response.data);
        toast.error(
          `Erreur: ${error.response.data.message || "Erreur de serveur"}`
        );
      } else if (axios.isAxiosError(error) && error.request) {
        toast.error("Le serveur ne répond pas. Vérifiez la connexion.");
      } else {
        toast.error("Erreur lors de l'envoi du prompt");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère la soumission de la version finale
   */
  const handleSubmitFinal = async (data: ChatData) => {
    // Vérification explicite des conditions pour soumettre
    console.log("handleSubmitFinal appelé avec:", data);
    console.log("État complet du formulaire:", methods.getValues());

    if (!conversationId) {
      console.error("Erreur: Aucune conversation active disponible");
      toast.error("Aucune conversation active disponible");
      return;
    }

    // Vérification plus précise du selectedPair
    const pairValue = data.selectedPair;
    console.log(
      "Type de selectedPair:",
      typeof pairValue,
      "Valeur:",
      pairValue
    );

    if (
      pairValue === null ||
      pairValue === undefined ||
      typeof pairValue !== "number"
    ) {
      console.error("Erreur: Aucune paire sélectionnée");
      toast.error("Veuillez sélectionner une réponse avant de soumettre");
      return;
    }

    console.log("Soumission de la version finale avec la paire:", pairValue);

    try {
      setIsSubmitting(true);

      // Récupération des paires prompt/réponse
      const promptResponsePairs: { prompt: string; response: string }[] = [];

      for (let i = 0; i < messages.length; i += 2) {
        if (i + 1 < messages.length) {
          const prompt = messages[i];
          const response = messages[i + 1];

          if (prompt.role === "user" && response.role === "ai") {
            promptResponsePairs.push({
              prompt: prompt.content,
              response: response.content,
            });
          }
        }
      }

      console.log("Paires prompt/réponse disponibles:", promptResponsePairs);

      // Récupération de la paire sélectionnée
      const selectedPromptResponse = promptResponsePairs[pairValue];
      console.log(
        "Index sélectionné:",
        pairValue,
        "Paires disponibles:",
        promptResponsePairs.length
      );

      if (!selectedPromptResponse) {
        console.error("Erreur: Paire sélectionnée introuvable");
        toast.error("Sélection invalide");
        return;
      }

      console.log("Paire sélectionnée:", selectedPromptResponse);

      // Sauvegarder les textes sélectionnés pour les afficher dans la confirmation
      setSelectedFinalPrompt(selectedPromptResponse.prompt);
      setSelectedFinalResponse(selectedPromptResponse.response);

      // Construction de l'URL et des données pour l'API
      const apiUrl = `http://localhost:3000/api/conversations/${conversationId}/final`;
      const apiData = {
        promptFinal: selectedPromptResponse.prompt,
        reponseIAFinale: selectedPromptResponse.response,
      };

      // Envoi de la version finale
      console.log(
        "Envoi de la requête pour enregistrer la version finale à:",
        apiUrl
      );
      console.log("Données envoyées:", apiData);

      const response = await axios.patch(apiUrl, apiData);

      console.log("Réponse reçue:", response.data);
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);

      // Mise à jour de la conversation avec la version finale
      setConversationData(response.data.conversation);

      // Afficher la boîte de dialogue de succès
      setShowSuccessDialog(true);

      // Réinitialiser le formulaire après soumission réussie
      methods.reset({
        ...methods.getValues(),
        selectedPair: null,
      });

      toast.success("Version finale enregistrée avec succès");
    } catch (error: unknown) {
      console.error(
        "Erreur lors de la soumission de la version finale:",
        error
      );

      if (axios.isAxiosError(error) && error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        console.error("Status de l'erreur:", error.response.status);
        console.error("Headers de l'erreur:", error.response.headers);
        toast.error(
          `Erreur: ${error.response.data.message || "Erreur de serveur"}`
        );
      } else if (axios.isAxiosError(error) && error.request) {
        console.error("Détails de la requête:", error.request);
        toast.error("Le serveur ne répond pas. Vérifiez la connexion.");
      } else {
        console.error("Erreur non-Axios:", error);
        toast.error("Erreur lors de la soumission de la version finale");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      {/* Message d'accueil lorsqu'aucune conversation n'est sélectionnée et qu'on affiche l'interface depuis la sidebar */}
      {conversationId === null && existingConversation === null && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-600">
          <MessageSquare className="h-16 w-16 mb-4 text-indigo-300 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">
            Bienvenue dans l'interface de chat
          </h2>
          <p className="mb-6 max-w-md">
            Sélectionnez une conversation existante dans la barre latérale ou
            créez-en une nouvelle pour commencer.
          </p>
          <Button
            onClick={() => {
              // Ne pas envoyer de message, juste afficher l'interface
              setConversationId(""); // Un ID vide indique une nouvelle conversation en cours de création
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Commencer une nouvelle conversation
          </Button>
        </div>
      )}

      {/* Interface de chat normale (même quand conversationId est une chaîne vide) */}
      {((conversationId !== null && conversationId !== undefined) ||
        existingConversation !== null) && (
        <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
            <CardTitle className="text-xl font-bold">
              Interface de Chat IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Affichage des statistiques de la conversation si disponible */}
            {conversationData && (
              <ConversationStats conversation={conversationData} />
            )}

            {/* Indicateur de version finale */}
            {hasVersionFinale && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">
                    Version finale soumise
                  </p>
                  <p className="text-green-600 text-sm">
                    Cette conversation a été finalisée et ne peut plus être
                    modifiée.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModelSelect />
              <PromptTypeSelect />
            </div>

            {/* Formulaire pour envoyer un prompt */}
            <form
              ref={promptFormRef}
              onSubmit={(e) => {
                e.preventDefault();
                methods.handleSubmit(handleSendPrompt)(e);
              }}
            >
              <PromptInput
                isLoading={isLoading}
                isDisabled={hasVersionFinale}
              />
            </form>

            <ResponseList
              messages={messages}
              isLoading={isLoading}
              modelName={currentModelName}
              messageModels={messageModels}
              isDisabled={hasVersionFinale}
              versionFinale={conversationData?.versionFinale}
            />

            {/* Formulaire pour soumettre la version finale */}
            {!hasVersionFinale && (
              <form
                ref={finalFormRef}
                id="final-form"
                onSubmit={(e) => {
                  // Intercepter et analyser l'événement de soumission
                  console.log("ÉVÉNEMENT DE SOUMISSION CAPTURÉ!", {
                    timeStamp: e.timeStamp,
                    type: e.type,
                    target: e.target,
                    currentTarget: e.currentTarget,
                    defaultPrevented: e.defaultPrevented,
                  });

                  // Bloquer l'action par défaut
                  e.preventDefault();
                  e.stopPropagation();

                  // Log des données actuelles
                  console.log("Formulaire final soumis manuellement");
                  console.log(
                    "Données actuelles du formulaire:",
                    methods.getValues()
                  );

                  // Vérifier qu'on a une paire sélectionnée
                  const pairValue = methods.getValues().selectedPair;
                  if (pairValue === null || pairValue === undefined) {
                    console.error(
                      "ERREUR: Aucune paire sélectionnée lors de la soumission"
                    );
                    toast.error(
                      "Veuillez sélectionner une réponse avant de soumettre"
                    );
                    return false;
                  }

                  // Appeler directement handleSubmitFinal
                  console.log("Appel direct de handleSubmitFinal");
                  try {
                    handleSubmitFinal(methods.getValues());
                  } catch (err) {
                    console.error("Erreur lors de l'appel manuel:", err);
                  }

                  console.log("Fin du handler de soumission");
                  return false;
                }}
              >
                <SubmitFinalButton
                  isSubmitting={isSubmitting}
                  disabled={messages.length === 0}
                />
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Boîte de dialogue de succès pour la soumission finale */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <Check className="mr-2 h-5 w-5" />
              Version finale soumise avec succès
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                La version finale de votre conversation a été enregistrée avec
                succès.
              </p>

              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-bold mb-1">Prompt sélectionné:</h4>
                <p className="text-xs text-gray-700 mb-3 whitespace-pre-wrap">
                  {selectedFinalPrompt}
                </p>

                <h4 className="text-sm font-bold mb-1">
                  Réponse IA sélectionnée:
                </h4>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                  {selectedFinalResponse}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-indigo-600 hover:bg-indigo-700">
              Compris
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
}
