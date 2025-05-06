import { Conversation } from "@/lib/models/conversation";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  await connectDB();

  try {
    // Attendre les paramètres avant d'y accéder (requis dans Next.js 15)
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;

    // Récupérer les données de version finale
    const { promptFinal, reponseIAFinale } = await request.json();

    if (!promptFinal || !reponseIAFinale) {
      return NextResponse.json(
        { error: "Le prompt final et la réponse finale sont requis" },
        { status: 400 }
      );
    }

    // Mettre à jour la conversation avec la version finale
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        versionFinale: {
          promptFinal,
          reponseIAFinale,
          soumisLe: new Date(),
        },
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
