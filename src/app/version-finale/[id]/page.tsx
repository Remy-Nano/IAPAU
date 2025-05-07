"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Conversation } from "@/types";
import axios from "axios";
import { ArrowLeft, Check, Clock, Sparkles, Zap } from "lucide-react";
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
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.03] duration-200 rounded-full px-5 py-2 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          Version finale de la conversation
        </h1>
        <p className="text-gray-600 text-lg">
          Cette version a été sélectionnée et validée par l&apos;étudiant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-1 shadow-md hover:shadow-lg transition-all duration-300 border-0">
          <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-gray-600">
              Titre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg">
              {conversation.titreConversation || "Sans titre"}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-md hover:shadow-lg transition-all duration-300 border-0">
          <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-gray-600">
              Date de soumission
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-indigo-500" />
            <p>{dateFormatee}</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-md hover:shadow-lg transition-all duration-300 border-0">
          <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-gray-600">
              Modèle utilisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full px-3 py-1 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {modelUtilise}
            </Badge>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-md hover:shadow-lg transition-all duration-300 border-0">
          <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tokens utilisés
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
            <p className="font-medium">{tokens}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card className="shadow-xl border-0 overflow-hidden rounded-xl transition-all hover:shadow-2xl duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl p-5">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 opacity-80" />
              <CardTitle className="text-xl font-bold">
                Question de l&apos;étudiant
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="whitespace-pre-wrap bg-white p-6 rounded text-md overflow-auto border-t border-indigo-100 leading-relaxed">
              {promptFinal}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 overflow-hidden rounded-xl transition-all hover:shadow-2xl duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl p-5">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 opacity-80" />
              <CardTitle className="text-xl font-bold">
                Réponse de l&apos;IA
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="whitespace-pre-wrap bg-white p-6 rounded text-md overflow-auto border-t border-purple-100 leading-relaxed">
              {reponseIAFinale}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-start gap-4 shadow-sm">
        <Check className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-green-800 font-semibold text-lg">
            Version finale validée
          </p>
          <p className="text-green-600 text-md">
            Cette version a été sélectionnée et validée par l&apos;étudiant
            comme la réponse finale à sa question.
          </p>
        </div>
      </div>
    </div>
  );
}
