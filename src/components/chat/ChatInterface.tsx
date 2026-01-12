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
 * Interface principale de chat permettant d'afficher les conversations.
 * La saisie de prompts est gérée par FixedPromptInput.
 */
export function ChatInterface({
  existingConversation = null,
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
      modelName: "openai",
      prompt: "",
      selectedPair: null,
      maxTokens: 512,
      temperature: 0.7,
    },
  });

  const currentModelName = methods.watch("modelName");

  // Tokens
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const tokensAuthorized = config.tokens.defaultLimit;

  // Conversation finalisée ?
  const hasVersionFinale = Boolean(
    conversationData?.versionFinale &&
      conversationData.versionFinale.promptFinal &&
      conversationData.versionFinale.reponseIAFinale
  );

  // Initialisation quand on reçoit une conversation depuis le dashboard
  useEffect(() => {
    if (existingConversation) {
      setConversationId(existingConversation._id);

      const updatedMessages = adaptMessagesRoles(
        existingConversation.messages,
        existingConversation.modelName || "openai"
      );

      setMessages(updatedMessages);
      setConversationData({
        ...existingConversation,
        messages: updatedMessages,
      });

      if (existingConversation.statistiquesIA?.tokensTotal) {
        setTokensUsed(existingConversation.statistiquesIA.tokensTotal);
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
    } else {
      // Aucun contexte (vue "Bienvenue")
      setConversationId(null);
      setMessages([]);
      setConversationData(null);
      setIsConfigValidated(false);

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

      // Construire la liste des paires prompt / réponse
      const promptResponsePairs: { prompt: string; response: string }[] =
        [];

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
        <div className="w-full pb-56">
          <Card className="bg-white shadow-2xl border-2 border-indigo-200/60 hover:border-indigo-300/80 hover:shadow-indigo-100/50 transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white rounded-t-xl border-b border-indigo-400/30">
              <CardTitle className="text-xl font-bold flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                Interface de Chat IA
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6 border-l-4 border-indigo-500/20">
              {/* Stats conversation */}
              {conversationData && (
                <ConversationStats conversation={conversationData} />
              )}

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
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-600"
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
                <div className="bg-indigo-50/80 border border-indigo-200/60 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-base font-semibold text-indigo-900">
                    Préparer votre conversation
                  </h3>
                  <p className="text-sm text-indigo-800/80">
                    Avant de commencer à discuter avec l&apos;IA, personnalisez
                    les paramètres de votre session. Vous pourrez ensuite poser
                    vos questions normalement.
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <ModelSelect />
                    <MaxTokensSlider />
                    <TemperatureSlider />
                    <PromptTypeSelect />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => setIsConfigValidated(true)}
                    >
                      Valider et commencer le chat
                    </Button>
                  </div>
                </div>
              )}

              {/* Bloc tokens (reste toujours visible) */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded-xl p-4 shadow-sm md:w-80">
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

              {/* Séparateur Messages */}
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

              {/* Liste des messages */}
              <ResponseList
                messages={messages}
                isLoading={isLoading}
                modelName={currentModelName}
                isDisabled={hasVersionFinale}
                versionFinale={conversationData?.versionFinale}
                streamingIndex={null}
                streamedResponse={""}
              />

              {/* Bouton soumission finale */}
              {!hasVersionFinale && (
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
            </CardContent>
          </Card>
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