"use client";

import { config } from "@/lib/config";
import { adaptMessagesRoles } from "@/lib/utils/messageUtils";
import axios from "axios";
import { Check, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Conversation, Message } from "../../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ConversationStats } from "./ConversationStats";
import { MaxTokensSlider } from "./MaxTokensSlider";
import { ModelSelect } from "./ModelSelect";
import { PromptTypeSelect } from "./PromptTypeSelect";
import { ResponseList } from "./ResponseList";
import { SubmitFinalButton } from "./SubmitFinalButton";
import { TemperatureSlider } from "./TemperatureSlider";
import { TokenCounter } from "./TokenCounter";

interface ChatData {
  titreConversation: string;
  promptType: "one shot" | "contextuel";
  modelName: string;
  prompt: string;
  selectedPair: number | null;
  maxTokens: number;
  temperature: number;
}

interface ChatInterfaceProps {
  existingConversation?: Conversation | null;
}

/**
 * Interface principale de chat permettant d'afficher les conversations
 * La saisie de prompts est maintenant gérée par FixedPromptInput
 */
export function ChatInterface({
  existingConversation = null,
}: ChatInterfaceProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationData, setConversationData] = useState<Conversation | null>(
    null
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedFinalPrompt, setSelectedFinalPrompt] = useState<string>("");
  const [selectedFinalResponse, setSelectedFinalResponse] =
    useState<string>("");

  // Références pour les formulaires
  const finalFormRef = useRef<HTMLFormElement>(null);

  const methods = useForm<ChatData>({
    defaultValues: {
      titreConversation: "",
      promptType: "one shot",
      modelName: "openai",
      prompt: "",
      selectedPair: null,
      maxTokens: 512,
      temperature: 0.7,
    },
  });

  const currentModelName = methods.watch("modelName");

  // État pour les tokens de l'utilisateur
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  // Utiliser la configuration centralisée pour la limite de tokens
  const tokensAuthorized = config.tokens.defaultLimit;

  // État pour vérifier si la conversation a une version finale
  const hasVersionFinale = Boolean(
    conversationData?.versionFinale &&
      conversationData.versionFinale.promptFinal &&
      conversationData.versionFinale.reponseIAFinale
  );

  // Initialiser le composant avec la conversation existante
  useEffect(() => {
    if (existingConversation) {
      setConversationId(existingConversation._id);

      // Adaptation des rôles et ajout du modelUsed si nécessaire
      const updatedMessages = adaptMessagesRoles(
        existingConversation.messages,
        existingConversation.modelName || "openai"
      );

      setMessages(updatedMessages);
      setConversationData({
        ...existingConversation,
        messages: updatedMessages,
      });

      // Mettre à jour les tokens
      if (existingConversation.statistiquesIA?.tokensTotal) {
        setTokensUsed(existingConversation.statistiquesIA.tokensTotal);
      }

      // Réinitialiser le formulaire avec les valeurs de la conversation
      methods.reset({
        titreConversation: existingConversation.titreConversation,
        promptType: existingConversation.promptType,
        modelName: existingConversation.modelName,
        prompt: "",
        selectedPair: null,
        maxTokens: existingConversation.maxTokens || 512,
        temperature: existingConversation.temperature || 0.7,
      });
    }
    // Si conversationId est une chaîne vide, cela signifie qu'on est en train d'initialiser une nouvelle conversation
    else if (conversationId === "") {
      // Pas besoin de réinitialiser les messages car ils sont déjà vides
      // Garder les valeurs actuelles du formulaire qui ont déjà été initialisées correctement
    } else {
      // Réinitialiser l'état pour une nouvelle conversation (cas initial)
      setConversationId(null);
      setMessages([]);
      setConversationData(null);

      // Réinitialiser le formulaire pour une nouvelle conversation
      methods.reset({
        titreConversation: "",
        promptType: "one shot",
        modelName: "openai",
        prompt: "",
        selectedPair: null,
        maxTokens: 512,
        temperature: 0.7,
      });
    }
  }, [existingConversation, methods, conversationId]);

  // Fonction simplifiée pour envoyer un prompt - maintenant gérée par FixedPromptInput
  // const handleSendPrompt = async (data: ChatData) => {

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
      const apiUrl = `/api/conversations/${conversationId}/final`;
      const apiData = {
        finalText: selectedPromptResponse.response,
        maxTokensUsed: data.maxTokens,
        temperatureUsed: data.temperature,
        promptFinal: selectedPromptResponse.prompt,
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

  const router = useRouter();

  return (
    <FormProvider {...methods}>
      {/* Message d'accueil lorsqu'aucune conversation n'est sélectionnée et qu'on affiche l'interface depuis la sidebar */}
      {conversationId === null && existingConversation === null && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-600">
          <MessageSquare className="h-16 w-16 mb-4 text-indigo-300 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">
            Bienvenue dans le chat IA{" "}
          </h2>
          <p className="mb-6 max-w-md">
            Sélectionnez une conversation existante dans la barre latérale ou
            créez-en une nouvelle pour commencer.
          </p>
          <Button
            onClick={() => {
              // Initialiser directement une nouvelle conversation avec un ID vide
              // pour permettre de commencer à interagir immédiatement
              setConversationId("");

              // Réinitialiser le formulaire avec des valeurs par défaut
              // pour une nouvelle conversation
              methods.reset({
                titreConversation: `Nouvelle conversation - ${new Date().toLocaleDateString(
                  "fr-FR"
                )}`,
                promptType: "one shot",
                modelName: "openai",
                prompt: "",
                selectedPair: null,
                maxTokens: 512,
                temperature: 0.7,
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Nouvelle conversation
          </Button>
        </div>
      )}

      {/* Interface de chat normale (même quand conversationId est une chaîne vide) */}
      {((conversationId !== null && conversationId !== undefined) ||
        existingConversation !== null) && (
        <>
          {/* Contenu principal du chat avec padding bottom pour la zone fixe */}
          <div className="w-full pb-56">
            <Card className="bg-white shadow-2xl border-2 border-indigo-200/60 hover:border-indigo-300/80 hover:shadow-indigo-100/50 transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white rounded-t-xl border-b border-indigo-400/30">
                <CardTitle className="text-xl font-bold flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                  Interface de Chat IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6 border-l-4 border-indigo-500/20">
                {/* Affichage des statistiques de la conversation si disponible */}
                {conversationData && (
                  <ConversationStats conversation={conversationData} />
                )}

                {/* Indicateur de version finale */}
                {hasVersionFinale && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 border border-emerald-200/50 p-4 rounded-lg shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-emerald-800 font-medium">
                          Version finale soumise
                        </p>
                        <p className="text-emerald-600 text-sm">
                          Cette conversation a été finalisée et ne peut plus
                          être modifiée.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-600"
                      onClick={() =>
                        router.push(`/version-finale/${conversationId}`)
                      }
                    >
                      Voir la version finale
                    </Button>
                  </div>
                )}

                {/* Section compteur de tokens et options */}
                <div className="space-y-6">
                  {/* Compteur de tokens et configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Compteur de tokens */}
                    <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded-xl p-4 shadow-sm md:col-span-1">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Crédits de tokens
                      </h3>
                      <TokenCounter
                        tokensUsed={tokensUsed}
                        tokensAuthorized={tokensAuthorized}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Tokens utilisés dans cette conversation
                      </p>
                    </div>

                    {/* Options de modèle et type de prompt */}
                    <div className="md:col-span-2 flex flex-col space-y-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-200/40 rounded-xl p-4 shadow-sm">
                      <ModelSelect />
                      <MaxTokensSlider />
                      <TemperatureSlider />
                      <PromptTypeSelect />
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">
                        Messages
                      </span>
                    </div>
                  </div>

                  <ResponseList
                    messages={messages}
                    isLoading={isLoading}
                    modelName={currentModelName}
                    isDisabled={hasVersionFinale}
                    versionFinale={conversationData?.versionFinale}
                    streamingIndex={null}
                    streamedResponse={""}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Boîte de dialogue de succès pour la soumission finale */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <Check className="mr-2 h-5 w-5" />
              Version finale soumise avec succès
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 text-sm text-gray-500 overflow-auto flex-grow">
            <p>
              La version finale de votre conversation a été enregistrée avec
              succès.
            </p>

            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-bold mb-1">Prompt sélectionné:</h4>
              <div className="text-xs text-gray-700 mb-3 whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-100 p-2 rounded">
                {selectedFinalPrompt}
              </div>

              <h4 className="text-sm font-bold mb-1">
                Réponse IA sélectionnée:
              </h4>
              <div className="text-xs text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto border border-gray-100 p-2 rounded">
                {selectedFinalResponse}
              </div>
            </div>
          </div>
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
