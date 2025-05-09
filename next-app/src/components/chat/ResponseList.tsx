import { BarChart2, Bot, Check, Clock } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Message } from "../../types";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";

interface ResponseListProps {
  messages: Message[];
  isLoading?: boolean;
  modelName?: string;
  messageModels?: Record<number, string>;
  isDisabled?: boolean;
  versionFinale?: {
    promptFinal: string;
    reponseIAFinale: string;
    soumisLe: string | Date;
  } | null;
}

/**
 * Formatage de la date pour l'affichage
 */
const formatDate = (date?: Date): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Composant d'affichage des messages et sélection de la version finale
 */
export function ResponseList({
  messages,
  isLoading = false,
  modelName = "IA",
  messageModels = {},
  isDisabled = false,
  versionFinale = null,
}: ResponseListProps) {
  const { control, watch, setValue } = useFormContext();
  const selectedPair = watch("selectedPair");

  // Réinitialiser la sélection si les messages changent
  useEffect(() => {
    if (messages.length === 0) {
      setValue("selectedPair", null);
    }
  }, [messages, setValue]);

  // Log pour déboguer la valeur de selectedPair
  useEffect(() => {
    console.log("Valeur actuelle de selectedPair:", selectedPair);
    console.log("Modèles de messages disponibles:", messageModels);
    console.log("Version finale disponible:", versionFinale);
  }, [selectedPair, messageModels, versionFinale]);

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
        // Utiliser le modèle spécifique stocké pour cette réponse, sinon utiliser le modèle global
        const responseModel = messageModels[i + 1] || modelName;

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
    console.log("Nouvelle sélection dans ResponseList:", index);
    // Vérifier que la sélection est bien enregistrée
    setTimeout(() => {
      console.log("Après sélection, selectedPair =", watch("selectedPair"));
    }, 0);
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Réponses disponibles</Label>

      <ScrollArea className="h-80 pr-4 overflow-y-auto">
        <div className="space-y-4">
          {promptResponsePairs.map((pair, index) => (
            <Card
              key={index}
              className={`p-4 space-y-3 transition-all duration-200 hover:shadow-md ${
                selectedPair === index
                  ? "border-indigo-400 ring-1 ring-indigo-400 bg-indigo-50"
                  : ""
              } ${
                pair.isVersionFinale
                  ? "border-2 border-green-500 ring-1 ring-green-400 bg-green-50/40"
                  : ""
              }`}
              onClick={() => handleSelectionChange(index)}
              role="button"
              tabIndex={0}
            >
              {pair.isVersionFinale && (
                <div className="flex items-center gap-2 -mt-2 -mx-2 mb-2 bg-green-100 p-2 rounded-t border-b border-green-200">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Version finale validée
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-800">Prompt</h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  {pair.promptTimestamp && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDate(pair.promptTimestamp)}</span>
                    </div>
                  )}
                  {pair.promptTokens && (
                    <div className="flex items-center">
                      <BarChart2 className="h-3 w-3 mr-1" />
                      <span>{pair.promptTokens} tokens</span>
                    </div>
                  )}
                </div>
                <p
                  className={`text-sm whitespace-pre-wrap mt-1 ${
                    pair.isVersionFinale
                      ? "font-medium text-gray-800"
                      : "text-gray-700"
                  }`}
                >
                  {pair.prompt}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 flex items-center justify-between">
                  <span>Réponse</span>
                  <div className="flex items-center gap-2">
                    {pair.isVersionFinale && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700 border-green-300"
                      >
                        Validée
                      </Badge>
                    )}
                    {pair.model && (
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 flex items-center"
                      >
                        <Bot className="h-3 w-3 mr-1" />
                        {pair.model}
                      </Badge>
                    )}
                  </div>
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  {pair.responseTimestamp && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDate(pair.responseTimestamp)}</span>
                    </div>
                  )}
                  {pair.responseTokens && (
                    <div className="flex items-center">
                      <BarChart2 className="h-3 w-3 mr-1" />
                      <span>{pair.responseTokens} tokens</span>
                    </div>
                  )}
                </div>
                <p
                  className={`text-sm whitespace-pre-wrap mt-1 ${
                    pair.isVersionFinale
                      ? "font-medium text-gray-800"
                      : "text-gray-700"
                  }`}
                >
                  {pair.response}
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {!isDisabled ? (
                  <>
                    <Controller
                      name="selectedPair"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id={`pair-${index}`}
                          checked={field.value === index}
                          onCheckedChange={() => {
                            handleSelectionChange(index);
                            // Simulation d'un événement de changement pour propager immédiatement
                            setTimeout(() => {
                              console.log(
                                "Forçage de la mise à jour après checkbox, selectedPair =",
                                watch("selectedPair")
                              );

                              // Essayer de déclencher un événement de changement sur le formulaire
                              const form = document.querySelector("form");
                              if (form) {
                                console.log(
                                  "Formulaire trouvé, simulation d'événement de changement"
                                );
                                const event = new Event("change", {
                                  bubbles: true,
                                });
                                form.dispatchEvent(event);
                              }
                            }, 50);
                          }}
                        />
                      )}
                    />
                    <Label
                      htmlFor={`pair-${index}`}
                      className="cursor-pointer text-indigo-700 font-medium"
                      onClick={(e) => {
                        e.stopPropagation(); // Empêcher le double déclenchement
                        handleSelectionChange(index);
                      }}
                    >
                      Sélectionner comme version finale
                    </Label>
                  </>
                ) : pair.isVersionFinale ? (
                  <div className="flex items-center">
                    <span className="text-green-600 font-medium flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Version finale validée
                    </span>
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
