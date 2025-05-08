import { formatRelativeTime } from "@/lib/date-utils";
import { Message } from "@/types";
import { BarChart2, Check, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
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
  const { control, watch, setValue } = useFormContext();
  const selectedPair = watch("selectedPair");
  const scrollRef = useRef<HTMLDivElement>(null);
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
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, setValue]);

  // On récupère les paires de prompts utilisateur/réponses IA
  // pour pouvoir sélectionner la version finale
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

  for (let i = 0; i < messages.length; i += 2) {
    if (i + 1 < messages.length) {
      const prompt = messages[i];
      const response = messages[i + 1];

      if (prompt.role === "user" && response.role === "ai") {
        // Utiliser le modèle stocké dans le message AI, sinon utiliser le modèle global
        const responseModel = response.modelUsed || modelName;

        // Log de débogage pour voir le modèle utilisé
        console.log(
          `Message AI ${i + 1} - Modèle: ${responseModel} (modelUsed: ${
            response.modelUsed || "non défini"
          })`
        );

        // Vérifier si cette paire correspond à la version finale
        const isVersionFinale = Boolean(
          versionFinale &&
            prompt.content === versionFinale.promptFinal &&
            response.content === versionFinale.reponseIAFinale
        );

        promptResponsePairs.push({
          promptIndex: i,
          prompt: prompt.content,
          responseIndex: i + 1,
          response: response.content,
          promptTimestamp: prompt.timestamp,
          responseTimestamp: response.timestamp,
          promptTokens: prompt.tokenCount,
          responseTokens: response.tokenCount,
          model: responseModel,
          isVersionFinale,
        });
      }
    }
  }

  // S'il n'y a qu'une seule paire, la sélectionner automatiquement
  useEffect(() => {
    if (promptResponsePairs.length === 1 && selectedPair === null) {
      setValue("selectedPair", 0);
    }
  }, [promptResponsePairs.length, selectedPair, setValue]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Aucun message pour le moment
      </div>
    );
  }

  // Gestionnaire pour mettre à jour la sélection
  const handleSelectionChange = (index: number) => {
    setValue("selectedPair", index);
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Réponses disponibles</Label>

      <ScrollArea className="h-[550px] pr-4 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-6">
          {[...promptResponsePairs].reverse().map((pair, index) => {
            // Calculer l'index réel dans le tableau original pour préserver le comportement de sélection
            const originalIndex = promptResponsePairs.length - 1 - index;

            return (
              <div
                key={originalIndex}
                className={cn("space-y-4 transition-all duration-300", {
                  "animate-in fade-in-50 zoom-in-95":
                    originalIndex === promptResponsePairs.length - 1,
                })}
                ref={
                  originalIndex === promptResponsePairs.length - 1
                    ? lastMessageRef
                    : null
                }
              >
                {/* User message */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      🧑‍🎓
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Card
                      className={cn(
                        "bg-blue-50 border-blue-100 shadow-sm p-4 transition-all duration-200",
                        {
                          "ring-2 ring-blue-300":
                            selectedPair === originalIndex,
                        },
                        { "border-2 border-green-500": pair.isVersionFinale }
                      )}
                    >
                      <CardContent className="p-0 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-blue-800">
                            Étudiant
                          </span>
                          {pair.promptTimestamp && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>
                                      {formatRelativeTime(pair.promptTimestamp)}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {new Date(
                                    pair.promptTimestamp
                                  ).toLocaleString("fr-FR")}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {pair.prompt}
                        </p>
                        {pair.promptTokens && (
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <BarChart2 className="h-3 w-3 mr-1" />
                            <span>{pair.promptTokens} tokens</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* AI Response - Handle temporary responses specially */}
                <div className="flex items-start gap-3 pl-8">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-indigo-100 text-indigo-800">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Card
                      className={cn(
                        "bg-white border shadow-sm p-4 transition-all duration-200",
                        {
                          "ring-2 ring-indigo-300":
                            selectedPair === originalIndex,
                        },
                        { "border-2 border-green-500": pair.isVersionFinale }
                      )}
                    >
                      <CardContent className="p-0 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-indigo-800">
                              IA
                            </span>
                            {pair.model && (
                              <Badge
                                variant="outline"
                                className={getModelBadgeStyles(pair.model)}
                              >
                                {pair.model}
                              </Badge>
                            )}
                          </div>
                          {pair.responseTimestamp && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>
                                      {formatRelativeTime(
                                        pair.responseTimestamp
                                      )}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {new Date(
                                    pair.responseTimestamp
                                  ).toLocaleString("fr-FR")}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        {/* Génération en cours ou réponse finale */}
                        {pair.response.includes(
                          "Génération de la réponse en cours"
                        ) ? (
                          <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-700"></div>
                            <p className="text-gray-500">
                              Génération de la réponse...
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {/* Afficher la version en streaming ou la réponse complète */}
                            {originalIndex === streamingIndex
                              ? streamedResponse
                              : pair.response}
                            {/* Ajouter un curseur clignotant pendant le streaming */}
                            {originalIndex === streamingIndex && (
                              <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-600 animate-pulse"></span>
                            )}
                          </p>
                        )}

                        {pair.responseTokens && (
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <BarChart2 className="h-3 w-3 mr-1" />
                            <span>{pair.responseTokens} tokens</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Sélection de version finale */}
                <div className="pl-12 mt-1">
                  {!isDisabled ? (
                    <div className="flex items-center space-x-2 pt-2">
                      <Controller
                        name="selectedPair"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`pair-${originalIndex}`}
                            checked={field.value === originalIndex}
                            onCheckedChange={() =>
                              handleSelectionChange(originalIndex)
                            }
                          />
                        )}
                      />
                      <Label
                        htmlFor={`pair-${originalIndex}`}
                        className="cursor-pointer text-indigo-700 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectionChange(originalIndex);
                        }}
                      >
                        Sélectionner comme version finale
                      </Label>
                    </div>
                  ) : pair.isVersionFinale ? (
                    <div className="flex items-center pt-2">
                      <span className="text-green-600 font-medium flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        Version finale validée
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
