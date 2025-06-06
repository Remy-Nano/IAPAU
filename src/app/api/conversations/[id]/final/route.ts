import { Conversation, IConversation } from "@/lib/models/conversation";
import { connectToDatabase } from "@/lib/mongoose";
import { FlattenMaps } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

// Interface étendue pour inclure les champs supplémentaires
interface ConversationDocument extends FlattenMaps<IConversation> {
  finalVersionDate?: Date;
  titreConversation?: string;
  __v: number;
}

export async function PATCH(request: Request, { params }: Params) {
  await connectToDatabase();

  try {
    // Attendre les paramètres avant d'y accéder (requis dans Next.js 15)
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;

    // Validation du schéma avec zod
    const finalBodySchema = z.object({
      finalText: z.string(),
      maxTokensUsed: z.number().int().min(0),
      temperatureUsed: z.number().min(0).max(1),
      promptFinal: z.string(),
    });

    // Récupérer les données de version finale
    const data = await request.json();
    const { finalText, maxTokensUsed, promptFinal, temperatureUsed } =
      finalBodySchema.parse(data);

    if (!finalText) {
      return NextResponse.json(
        { error: "Le texte final est requis" },
        { status: 400 }
      );
    }

    // Mettre à jour la conversation avec la version finale
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        versionFinale: {
          promptFinal: promptFinal || "", // Utiliser le promptFinal s'il est fourni
          reponseIAFinale: finalText,
          soumisLe: new Date(),
        },
        maxTokensUsed,
        temperatureUsed,
      },
      { new: true }
    ).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
      message: "Version finale enregistrée avec succès",
    });
  } catch (err: unknown) {
    console.error("Erreur d'enregistrement de version finale:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: Params) {
  await connectToDatabase();

  try {
    // Attendre les paramètres avant d'y accéder (requis dans Next.js 15)
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;

    // Récupérer la conversation
    const conversation = (await Conversation.findById(
      conversationId
    ).lean()) as ConversationDocument;

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier qu'une version finale a bien été enregistrée
    if (!conversation?.versionFinale) {
      return NextResponse.json(
        { error: "Cette conversation n'a pas de version finale" },
        { status: 404 }
      );
    }

    // Convertir finalVersionDate en chaîne si elle existe
    const finalVersionDate = conversation.finalVersionDate
      ? conversation.finalVersionDate.toISOString()
      : conversation.versionFinale.soumisLe
      ? conversation.versionFinale.soumisLe.toISOString()
      : new Date().toISOString();

    // Extraire les valeurs de versionFinale
    const { promptFinal = "" } = conversation.versionFinale;
    // Récupérer le texte final depuis la structure versionFinale correcte
    const finalText = conversation.versionFinale.reponseIAFinale || "";

    // Retourner les données formatées
    return NextResponse.json({
      success: true,
      promptFinal,
      finalText,
      finalVersionDate,
      maxTokensUsed: conversation.maxTokensUsed ?? null,
      temperatureUsed: conversation.temperatureUsed ?? null,
      conversation: {
        statistiquesIA: conversation.statistiquesIA,
        modelName: conversation.modelName,
        titreConversation: conversation.titreConversation,
      },
    });
  } catch (err: unknown) {
    console.error("Erreur de récupération de version finale:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
