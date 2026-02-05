"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { ArrowLeft, Check, Clock, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Ajouter ces interfaces en haut du fichier, sous les imports
interface FinalVersionResponse {
  success: boolean;
  promptFinal: string;
  finalText: string;
  finalVersionDate: string;
  maxTokensUsed: number | null;
  temperatureUsed: number | null;
  error?: string;
  conversation?: {
    statistiquesIA?: {
      tokensTotal: number;
      modelUtilise: string;
    };
    modelName?: string;
    titreConversation?: string;
  };
}

interface EnhancedConversation {
  promptFinal: string;
  finalText: string;
  finalVersionDate: string;
  maxTokensUsed: number | null;
  temperatureUsed: number | null;
  statistiquesIA?: {
    tokensTotal: number;
    modelUtilise: string;
  };
  modelName?: string;
  titreConversation?: string;
}

export default function VersionFinalePage() {
  const { id } = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<EnhancedConversation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);

        // Utiliser l'API pour recuperer la conversation
        const response = await axios.get<FinalVersionResponse>(
          `/api/conversations/${id}/final`
        );
        const {
          promptFinal,
          finalText,
          finalVersionDate,
          maxTokensUsed,
          temperatureUsed,
        } = response.data;

        if (response.data.error) {
          setError("Conversation non trouvee");
          return;
        }

        setConversation({
          promptFinal,
          finalText,
          finalVersionDate,
          maxTokensUsed,
          temperatureUsed,
          statistiquesIA: response.data.conversation?.statistiquesIA,
          modelName: response.data.conversation?.modelName,
          titreConversation: response.data.conversation?.titreConversation,
        });
      } catch (err) {
        console.error(
          "Erreur lors de la recuperation de la conversation:",
          err
        );
        setError("Erreur lors de la recuperation de la conversation");
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

  if (!conversation) {
    return null;
  }

  const {
    promptFinal,
    finalText,
    finalVersionDate,
    maxTokensUsed,
    temperatureUsed,
  } = conversation;

  // Formatage de la date
  const dateObj = new Date(finalVersionDate);
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

  // Recuperer les donnees de la conversation, y compris maxTokensUsed
  const tokens = conversation.statistiquesIA?.tokensTotal || 0;
  const modelUtilise =
    conversation.statistiquesIA?.modelUtilise ||
    conversation.modelName ||
    "Modele inconnu";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 shadow-[0_8px_20px_-14px_rgba(2,6,23,0.6)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Version finale
            </h1>
            <p className="text-slate-600">
              Cette version a ete selectionnee et validee par l&apos;etudiant.
            </p>
          </div>
          <Badge className="bg-cyan-500/10 text-cyan-700 border border-cyan-500/30 rounded-full px-3 py-1">
            Validee
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="col-span-1 border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_12px_28px_-20px_rgba(2,6,23,0.25)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Titre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-slate-900">
                {conversation.titreConversation || "Sans titre"}
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1 border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_12px_28px_-20px_rgba(2,6,23,0.25)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Date de soumission
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-slate-700">
              <Clock className="h-4 w-4 mr-2 text-cyan-600" />
              <p>{dateFormatee}</p>
            </CardContent>
          </Card>

          <Card className="col-span-1 border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_12px_28px_-20px_rgba(2,6,23,0.25)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Modele utilise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-slate-900 text-white rounded-full px-3 py-1 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {modelUtilise}
              </Badge>
            </CardContent>
          </Card>

          <Card className="col-span-1 border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_12px_28px_-20px_rgba(2,6,23,0.25)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Tokens utilises
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-slate-700">
              <Zap className="h-4 w-4 mr-2 text-amber-500" />
              <p className="font-medium">{tokens}</p>
            </CardContent>
          </Card>

        {maxTokensUsed != null && (
          <Card className="col-span-1 border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_12px_28px_-20px_rgba(2,6,23,0.25)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Max tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-slate-700">
              <Zap className="h-4 w-4 mr-2 text-orange-500" />
              <p className="font-medium">{maxTokensUsed}</p>
            </CardContent>
          </Card>
        )}

        {temperatureUsed != null && (
          <Card className="col-span-1 border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_12px_28px_-20px_rgba(2,6,23,0.25)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Temperature utilisee
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-slate-700">
              <Zap className="h-4 w-4 mr-2 text-orange-500" />
              <p className="font-medium">{temperatureUsed}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-8">
        <Card className="border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_18px_40px_-26px_rgba(2,6,23,0.35)]">
          <CardHeader className="p-5 border-b border-slate-200/70">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-cyan-600" />
              <CardTitle className="text-xl font-semibold text-slate-900">
                Question de l&apos;etudiant
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {promptFinal}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 rounded-2xl shadow-[0_18px_40px_-26px_rgba(2,6,23,0.35)]">
          <CardHeader className="p-5 border-b border-slate-200/70">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-cyan-600" />
              <CardTitle className="text-xl font-semibold text-slate-900">
                Reponse de l&apos;IA
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {finalText}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-5 bg-white/90 border border-amber-200/80 rounded-2xl flex items-start gap-4 shadow-[0_12px_28px_-22px_rgba(2,6,23,0.25)]">
        <Check className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-slate-900 font-semibold text-lg">
            Version finale validee
          </p>
          <p className="text-slate-600 text-md">
            Cette version a ete selectionnee et validee par l&apos;etudiant
            comme la reponse finale a sa question.
          </p>
          {maxTokensUsed != null && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Max tokens utilise :</strong> {maxTokensUsed}
            </p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
