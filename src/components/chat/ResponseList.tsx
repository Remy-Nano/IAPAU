import { formatRelativeTime } from "@/lib/date-utils";
import { Message } from "@/types";
import { BarChart2, Clock, MessageSquareOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ResponseListProps {
  messages: Message[];
  isLoading?: boolean;
  modelName?: string; // Modèle par défaut (si modelUsed n'est pas disponible)
  isDisabled?: boolean;
  versionFinale?: {
    promptFinal: string;
    reponseIAFinale: string;
    soumisLe: string | Date;
  } | null;
  streamingIndex?: number | null;
  streamedResponse?: string;
}

// Fonction pour obtenir la couleur du badge selon le modèle
const getModelBadgeStyles = (modelName: string = ""): string => {
  const modelLower = modelName.toLowerCase();

  if (modelLower.includes("openai") || modelLower === "openai") {
    return "bg-green-50 text-green-700 border-green-200";
  } else if (modelLower.includes("mistral") || modelLower === "mistral") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  // Style par défaut
  return "bg-indigo-50 text-indigo-700 border-indigo-200";
};

/**
 * Composant d'affichage des messages et sélection de la version finale
 */
export function ResponseList({
  messages,
  isLoading = false,
  modelName = "IA",
  isDisabled = false,
  versionFinale = null,
  streamingIndex = null,
  streamedResponse = "",
}: ResponseListProps) {
  const { watch, setValue } = useFormContext();
  const selectedPair = watch("selectedPair");
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Réinitialiser la sélection si les messages changent
  useEffect(() => {
    if (messages.length === 0) {
      setValue("selectedPair", null);
    }

    // Log pour vérifier les modèles des messages
    const aiMessages = messages.filter((m) => m.role === "ai");
    if (aiMessages.length > 0) {
      console.log(
        "Modèles dans les messages IA:",
        aiMessages.map((m, i) => `Message ${i}: ${m.modelUsed || "non défini"}`)
      );
    }

    // Scroll to bottom when new messages come in
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, setValue]);

  // On récupère les paires de prompts utilisateur/réponses IA
  // en mode robuste (ne pas dépendre d'un alternance stricte)
  const promptResponsePairs: {
    promptIndex: number;
    prompt: string;
    responseIndex: number;
    response: string;
    promptTimestamp?: Date;
    responseTimestamp?: Date;
    promptTokens?: number;
    responseTokens?: number;
    model?: string;
    isVersionFinale?: boolean;
  }[] = [];

  let pendingPrompt:
    | {
        index: number;
        content: string;
        timestamp?: Date;
        tokenCount?: number;
      }
    | null = null;

  messages.forEach((message, i) => {
    const isUserMessage = message.role === "user" || message.role === "student";
    const isAiMessage = message.role === "ai" || message.role === "assistant";

    if (isUserMessage) {
      pendingPrompt = {
        index: i,
        content: message.content,
        timestamp: message.timestamp,
        tokenCount: message.tokenCount,
      };
      return;
    }

    if (isAiMessage && pendingPrompt) {
      const responseModel = message.modelUsed || modelName;

      console.log(
        `Message AI ${i} - Modèle: ${responseModel} (modelUsed: ${
          message.modelUsed || "non défini"
        })`
      );

      const isVersionFinale = Boolean(
        versionFinale &&
          pendingPrompt.content === versionFinale.promptFinal &&
          message.content === versionFinale.reponseIAFinale
      );

      promptResponsePairs.push({
        promptIndex: pendingPrompt.index,
        prompt: pendingPrompt.content,
        responseIndex: i,
        response: message.content,
        promptTimestamp: pendingPrompt.timestamp,
        responseTimestamp: message.timestamp,
        promptTokens: pendingPrompt.tokenCount,
        responseTokens: message.tokenCount,
        model: responseModel,
        isVersionFinale,
      });

      pendingPrompt = null;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500 gap-2">
        <MessageSquareOff className="h-4 w-4 text-gray-400" />
        <span>Aucun message pour le moment</span>
      </div>
    );
  }

  // Gestionnaire pour mettre à jour la sélection
  const handleSelectionChange = (index: number) => {
    setValue("selectedPair", selectedPair === index ? null : index);
    if (selectedPair !== index) {
      requestAnimationFrame(() => {
        const finalForm = document.getElementById("final-form");
        finalForm?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const responseIndexToPair = new Map<number, (typeof promptResponsePairs)[number] & { pairIndex: number }>();
  promptResponsePairs.forEach((pair, idx) => {
    responseIndexToPair.set(pair.responseIndex, { ...pair, pairIndex: idx });
  });

  return (
    <div className="space-y-4">
      {messages.map((message, i) => {
        const isUser = message.role === "user" || message.role === "student";
        const pairInfo = responseIndexToPair.get(i);
        const pairIndex = pairInfo?.pairIndex ?? null;
        const isStreaming = pairIndex !== null && pairIndex === streamingIndex;
        const isFinale = Boolean(pairInfo?.isVersionFinale);

        return (
          <div
            key={message._id || i}
            className={cn("flex items-start gap-3", { "justify-end": isUser })}
            ref={i === messages.length - 1 ? lastMessageRef : null}
          >
            {!isUser && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-indigo-100 text-indigo-800">
                  🤖
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 max-w-[720px]">
              <Card
                className={cn(
                  "p-3 rounded-2xl border shadow-[0_6px_18px_-14px_rgba(2,6,23,0.25)] transition-all duration-200",
                  isUser ? "bg-white border-slate-200/70" : "bg-white/90 border-slate-200/70",
                  { "ring-1 ring-cyan-400/40 bg-cyan-500/5": pairIndex !== null && selectedPair === pairIndex },
                  { "border border-amber-400/40 bg-amber-200/10": isFinale }
                )}
              >
                <CardContent className="p-0 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">
                        {isUser ? "Vous" : "IA"}
                      </span>
                      {!isUser && pairInfo?.model && (
                        <Badge
                          variant="outline"
                          className={cn(getModelBadgeStyles(pairInfo.model), "text-[11px] px-2 py-0.5")}
                        >
                          {pairInfo.model}
                        </Badge>
                      )}
                    </div>
                    {message.timestamp && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatRelativeTime(message.timestamp)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {new Date(message.timestamp).toLocaleString("fr-FR")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {message.content.includes("Génération de la réponse en cours") ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-700"></div>
                      <p className="text-slate-500">Génération de la réponse...</p>
                    </div>
                  ) : (
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {isStreaming ? streamedResponse : message.content}
                      {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-0.5 bg-cyan-500 animate-pulse rounded-sm"></span>
                      )}
                    </p>
                  )}

                  {isStreaming && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>IA écrit</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0ms]" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:120ms]" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:240ms]" />
                    </div>
                  )}

                  {message.tokenCount && (
                    <div className="flex items-center text-[11px] text-slate-500 mt-2">
                      <BarChart2 className="h-3 w-3 mr-1" />
                      <span>{message.tokenCount} tokens</span>
                    </div>
                  )}

                  {!isUser && pairIndex !== null && (
                    <div className="pt-2 flex items-center justify-between gap-3">
                      {isFinale ? (
                        <span className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-full bg-amber-200/30 text-amber-700 border border-amber-300/40">
                          Réponse finale validée
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full border transition",
                            selectedPair === pairIndex
                              ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/40"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          )}
                          onClick={() => handleSelectionChange(pairIndex)}
                          disabled={isDisabled}
                        >
                          {selectedPair === pairIndex
                            ? "Réponse sélectionnée"
                            : "Sélectionner cette réponse"}
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {isUser && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-slate-100 text-slate-700">
                  🧑‍🎓
                </AvatarFallback>
              </Avatar>
            )}

            {null}
          </div>
        );
      })}
    </div>
  );
}
