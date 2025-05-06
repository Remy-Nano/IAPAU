"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Conversation } from "@/types";
import axios from "axios";
import { ArrowLeft, Check, Clock, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VersionFinalePage() {
  const { id } = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);

        // Utiliser l'API pour récupérer la conversation
        const response = await axios.get(`/api/conversations/${id}`);
        const convo = response.data.conversation;

        if (!convo) {
          setError("Conversation non trouvée");
          return;
        }

        if (!convo.versionFinale || !convo.versionFinale.promptFinal) {
          setError("Cette conversation n'a pas de version finale");
          return;
        }

        setConversation(convo);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération de la conversation:",
          err
        );
        setError("Erreur lors de la récupération de la conversation");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConversation();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-lg text-center">
          <p className="text-xl font-semibold mb-2">Erreur</p>
          <p>{error}</p>
          <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!conversation || !conversation.versionFinale) {
    return null;
  }

  const { promptFinal, reponseIAFinale, soumisLe } = conversation.versionFinale;

  // Formatage de la date
  const dateObj = new Date(soumisLe);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const dateFormatee = new Intl.DateTimeFormat("fr-FR", options).format(
    dateObj
  );

  const tokens = conversation.statistiquesIA?.tokensTotal || 0;
  const modelUtilise =
    conversation.statistiquesIA?.modelUtilise ||
    conversation.modelName ||
    "Modèle inconnu";

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Version finale de la conversation
        </h1>
        <p className="text-gray-600">
          Cette version a été sélectionnée et validée par l'étudiant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Titre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg">
              {conversation.titreConversation || "Sans titre"}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Date de soumission
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <p>{dateFormatee}</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Modèle utilisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-200"
            >
              {modelUtilise}
            </Badge>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tokens utilisés
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
            <p>{tokens}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-700 mr-2" />
              <CardTitle className="text-blue-700">
                Question de l'étudiant
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap">{promptFinal}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-indigo-700 mr-2" />
              <CardTitle className="text-indigo-700">Réponse de l'IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap">{reponseIAFinale}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-green-800 font-medium">Version finale validée</p>
          <p className="text-green-600 text-sm">
            Cette version a été sélectionnée et validée par l'étudiant comme la
            réponse finale à sa question.
          </p>
        </div>
      </div>
    </div>
  );
}
