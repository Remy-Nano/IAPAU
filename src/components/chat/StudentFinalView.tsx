"use client";

import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Clock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

// Type pour la version finale
interface FinalVersion {
  prompt: string;
  response: string;
  model: string;
  submittedAt: string;
}

export function StudentFinalView() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const router = useRouter();
  const [finalVersion, setFinalVersion] = useState<FinalVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinalVersion = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Appeler l'API pour récupérer la version finale
        const response = await axios.get(
          `http://localhost:3000/api/conversations/${conversationId}/version-finale`
        );

        if (response.data?.success) {
          setFinalVersion(response.data.finalVersion);
        } else {
          setError("Impossible de charger la version finale");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la version finale:", error);
        setError("Erreur lors du chargement de la version finale");
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      fetchFinalVersion();
    }
  }, [conversationId]);

  // Formater la date relative
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Format relatif (ex: "il y a 2 heures")
      const relativeTime = formatDistanceToNow(date, {
        addSuffix: true,
        locale: fr,
      });

      // Format absolu (ex: "15 avril 2025 à 12:34")
      const absoluteTime = date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return { relativeTime, absoluteTime };
    } catch {
      return { relativeTime: "Date inconnue", absoluteTime: "Date inconnue" };
    }
  };

  // Obtenir le style du badge en fonction du modèle
  const getModelBadgeStyle = (modelName: string): string => {
    const model = modelName.toLowerCase();

    if (model.includes("openai") || model === "openai") {
      return "bg-green-700 text-white";
    } else if (model.includes("mistral") || model === "mistral") {
      return "bg-blue-700 text-white";
    }

    return "bg-gray-700 text-gray-300";
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Version Finale</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-600 text-sm mt-1">
            La version finale n'a pas pu être chargée ou n'existe pas.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/conversations/${conversationId}`)}
          >
            Retourner à la conversation
          </Button>
        </div>
      ) : finalVersion ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className={getModelBadgeStyle(finalVersion.model)}>
                {finalVersion.model}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span title={formatDate(finalVersion.submittedAt).absoluteTime}>
                  Soumis {formatDate(finalVersion.submittedAt).relativeTime}
                </span>
              </div>
            </div>
          </div>

          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-lg">Prompt final</CardTitle>
            </CardHeader>
            <CardContent className="p-4 prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm font-mono overflow-auto">
                {finalVersion.prompt}
              </pre>
            </CardContent>
          </Card>

          <Separator />

          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <CardTitle className="text-lg">Réponse de l'IA</CardTitle>
            </CardHeader>
            <CardContent className="p-4 prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm font-mono overflow-auto">
                {finalVersion.response}
              </pre>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
          <p className="text-amber-700 font-medium">
            Aucune version finale disponible
          </p>
          <p className="text-amber-600 text-sm mt-1">
            Cette conversation n'a pas encore de version finale soumise.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/conversations/${conversationId}`)}
          >
            Retourner à la conversation
          </Button>
        </div>
      )}
    </div>
  );
}
