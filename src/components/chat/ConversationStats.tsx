import { BarChart2, Clock, Info } from "lucide-react";
import { Conversation } from "../../types";
import { Card, CardContent } from "../ui/card";

interface ConversationStatsProps {
  conversation: Conversation;
}

/**
 * Composant affichant les statistiques d'une conversation
 */
export function ConversationStats({ conversation }: ConversationStatsProps) {
  // Formatter une date
  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="mb-4 bg-gray-50">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <h3 className="text-md font-medium flex items-center">
            <Info className="h-4 w-4 mr-2 text-indigo-600" />
            Informations sur la conversation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {/* Date de création */}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-600">Créée le:</span>
              <span className="ml-2 font-medium">
                {formatDate(conversation.createdAt)}
              </span>
            </div>

            {/* Date de mise à jour */}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-600">Mise à jour:</span>
              <span className="ml-2 font-medium">
                {formatDate(conversation.updatedAt)}
              </span>
            </div>

            {/* Modèle utilisé */}
            <div className="flex items-center">
              <span className="text-gray-600">Modèle:</span>
              <span className="ml-2 font-semibold text-indigo-600">
                {conversation.modelName}
              </span>
            </div>

            {/* Type de prompt */}
            <div className="flex items-center">
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium">
                {conversation.promptType}
              </span>
            </div>

            {/* Tokens total si disponible */}
            {conversation.statistiquesIA && (
              <div className="flex items-center col-span-2">
                <BarChart2 className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Tokens utilisés:</span>
                <span className="ml-2 font-semibold text-indigo-600">
                  {conversation.statistiquesIA.tokensTotal} tokens
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  avec {conversation.statistiquesIA.modelUtilise}
                </span>
              </div>
            )}

            {/* Version finale si disponible */}
            {conversation.versionFinale && (
              <div className="flex items-center col-span-2">
                <span className="text-gray-600">
                  Version finale soumise le:
                </span>
                <span className="ml-2 font-medium">
                  {formatDate(conversation.versionFinale.soumisLe)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
