"use client";

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
import { MaxTokensSlider } from "./MaxTokensSlider";
import { ModelSelect } from "./ModelSelect";
import { PromptTypeSelect } from "./PromptTypeSelect";
import { ResponseList } from "./ResponseList";
import { SubmitFinalButton } from "./SubmitFinalButton";
import { TemperatureSlider } from "./TemperatureSlider";

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
  onConfigValidatedChange?: (ready: boolean) => void;
  onTokensChange?: (tokensUsed: number) => void;
  streamingIndex?: number | null;
  streamedResponse?: string;
}

/**
 * Interface principale de chat permettant d'afficher les conversations.
 * La saisie de prompts est gérée par FixedPromptInput.
 */
export function ChatInterface({
  existingConversation = null,
  onConfigValidatedChange,
  onTokensChange,
  streamingIndex = null,
  streamedResponse = "",
}: ChatInterfaceProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationData, setConversationData] =
    useState<Conversation | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedFinalPrompt, setSelectedFinalPrompt] =
    useState<string>("");
  const [selectedFinalResponse, setSelectedFinalResponse] =
    useState<string>("");

  // Étape "paramètres" avant de commencer le chat
  const [isConfigValidated, setIsConfigValidated] = useState(false);

  const finalFormRef = useRef<HTMLFormElement>(null);

  const methods = useForm<ChatData>({
    defaultValues: {
      titreConversation: "",
      promptType: "one shot",
      modelName: "mistral",
      prompt: "",
      selectedPair: null,
      maxTokens: 512,
      temperature: 0.7,
    },
  });

  const currentModelName = methods.watch("modelName");
  const selectedPair = methods.watch("selectedPair");



  // Conversation finalisée ?
  const hasVersionFinale = Boolean(
    conversationData?.versionFinale &&
      conversationData.versionFinale.promptFinal &&
      conversationData.versionFinale.reponseIAFinale
  );
  const isChatReady = hasVersionFinale || isConfigValidated;

  // Initialisation quand on reçoit une conversation depuis le dashboard
  useEffect(() => {
    if (existingConversation) {
      setConversationId(existingConversation._id);

      const updatedMessages = adaptMessagesRoles(
        existingConversation.messages,
        existingConversation.modelName || "mistral"
      );

      setMessages(updatedMessages);
      setConversationData({
        ...existingConversation,
        messages: updatedMessages,
      });

      if (existingConversation.statistiquesIA?.tokensTotal) {
        onTokensChange?.(existingConversation.statistiquesIA.tokensTotal);
      }


      methods.reset({
        titreConversation: existingConversation.titreConversation,
        promptType: existingConversation.promptType,
        modelName: existingConversation.modelName,
        prompt: "",
        selectedPair: null,
        maxTokens: existingConversation.maxTokens || 512,
        temperature: existingConversation.temperature || 0.7,
      });

      // Si la conversation a déjà des messages, on considère
      // que la config est déjà faite.
      setIsConfigValidated(updatedMessages.length > 0);
    } else if (conversationId === "") {
      // Nouvelle conversation créée -> config non validée
      setIsConfigValidated(false);
      onTokensChange?.(0);
    } else {
      // Aucun contexte (vue "Bienvenue")
      setConversationId(null);
      setMessages([]);
      setConversationData(null);
      setIsConfigValidated(false);

      methods.reset({
        titreConversation: "",
        promptType: "one shot",
        modelName: "mistral",
        prompt: "",
        selectedPair: null,
        maxTokens: 512,
        temperature: 0.7,
      });
    }
  }, [existingConversation, methods, conversationId, onTokensChange]);

  useEffect(() => {
    onConfigValidatedChange?.(isChatReady);
  }, [isChatReady, onConfigValidatedChange]);

  /**
   * Soumission de la version finale
   */
  const handleSubmitFinal = async (data: ChatData) => {
    if (!conversationId) {
      toast.error("Aucune conversation active disponible");
      return;
    }

    const pairValue = data.selectedPair;
    if (
      pairValue === null ||
      pairValue === undefined ||
      typeof pairValue !== "number"
    ) {
      toast.error("Veuillez sélectionner une réponse avant de soumettre");
      return;
    }

    try {
      setIsSubmitting(true);

      // Construire la liste des paires prompt / réponse (robuste)
      const promptResponsePairs: { prompt: string; response: string }[] = [];
      let pendingPrompt: { content: string } | null = null;

      messages.forEach((message) => {
        const isUserMessage = message.role === "user" || message.role === "student";
        const isAiMessage = message.role === "ai" || message.role === "assistant";

        if (isUserMessage) {
          pendingPrompt = { content: message.content };
          return;
        }

        if (isAiMessage && pendingPrompt) {
          promptResponsePairs.push({
            prompt: pendingPrompt.content,
            response: message.content,
          });
          pendingPrompt = null;
        }
      });

      const selectedPromptResponse = promptResponsePairs[pairValue];
      if (!selectedPromptResponse) {
        toast.error("Sélection invalide");
        return;
      }

      setSelectedFinalPrompt(selectedPromptResponse.prompt);
      setSelectedFinalResponse(selectedPromptResponse.response);

      await axios.patch(`/api/conversations/${conversationId}/final`, {
        finalText: selectedPromptResponse.response,
        maxTokensUsed: data.maxTokens,
        temperatureUsed: data.temperature,
        promptFinal: selectedPromptResponse.prompt,
      });

      toast.success("Version finale enregistrée avec succès");
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Erreur lors de la soumission finale :", error);
      toast.error("Erreur lors de la soumission de la version finale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const router = useRouter();

  return (
    <FormProvider {...methods}>
      {/* Écran d’accueil si aucune conversation sélectionnée */}
      {conversationId === null && existingConversation === null && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-600">
          <MessageSquare className="h-16 w-16 mb-4 text-indigo-300 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">
            Bienvenue dans le chat IA
          </h2>
          <p className="mb-6 max-w-md">
            Sélectionnez une conversation existante dans la barre latérale
            ou créez-en une nouvelle pour commencer.
          </p>
        </div>
      )}

      {/* Interface de chat normale */}
      {((conversationId !== null && conversationId !== undefined) ||
        existingConversation !== null) && (
        <div className="w-full">
          <div className="space-y-6">

              {/* Bandeau version finale */}
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
                    className="bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 rounded-full px-4"
                    onClick={() =>
                      router.push(`/version-finale/${conversationId}`)
                    }
                  >
                    Voir la version finale
                  </Button>
                </div>
              )}

              {/* 🟣 Étape 1 : Paramètres avant de commencer */}
              {!hasVersionFinale && !isConfigValidated && (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_36px_-26px_rgba(2,6,23,0.35)]">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-300/60 via-slate-500/40 to-cyan-300/60" />
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Configurez votre session avant de démarrer
                      </p>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Paramètres de session
                      </h3>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 border border-cyan-500/30">
                      Étape 1
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ModelSelect />
                    <PromptTypeSelect />
                    <TemperatureSlider />
                    <MaxTokensSlider />
                  </div>

                  <div className="mt-3 flex justify-end border-t border-slate-200/70 pt-3">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white shadow-[0_10px_22px_-16px_rgba(15,23,42,0.35)]"
                      onClick={() => setIsConfigValidated(true)}
                    >
                      Commencer
                    </Button>
                  </div>
                </div>
              )}

              {/* Liste des messages */}
              {isChatReady && (
                <ResponseList
                  messages={messages}
                  isLoading={isLoading}
                  modelName={currentModelName}
                  isDisabled={hasVersionFinale}
                  versionFinale={conversationData?.versionFinale}
                  streamingIndex={streamingIndex}
                  streamedResponse={streamedResponse}
                />
              )}

              {/* Bouton soumission finale */}
              {!hasVersionFinale && isChatReady && messages.length > 0 && selectedPair !== null && (
                <form
                  ref={finalFormRef}
                  id="final-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const pairValue = methods.getValues().selectedPair;

                    if (
                      pairValue === null ||
                      pairValue === undefined
                    ) {
                      toast.error(
                        "Veuillez sélectionner une réponse avant de soumettre"
                      );
                      return;
                    }

                    handleSubmitFinal(methods.getValues());
                  }}
                >
                  <SubmitFinalButton
                    isSubmitting={isSubmitting}
                    disabled={messages.length === 0}
                  />
                </form>
              )}

          </div>
        </div>
      )}

      {/* Dialogue succès version finale */}
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
              La version finale de votre conversation a été enregistrée
              avec succès.
            </p>

            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-bold mb-1">
                Prompt sélectionné :
              </h4>
              <div className="text-xs text-gray-700 mb-3 whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-100 p-2 rounded">
                {selectedFinalPrompt}
              </div>

              <h4 className="text-sm font-bold mb-1">
                Réponse IA sélectionnée :
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
