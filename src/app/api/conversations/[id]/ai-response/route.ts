import { generateAIResponse } from "@/lib/ai-service";
import {
  addMessage,
  getConversation,
} from "@/lib/controllers/conversationController";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function POST(request: Request, { params }: Params) {
  await connectDB();

  try {
    // Attendre les paramètres avant d'y accéder (requis dans Next.js 15)
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;

    // Récupérer la conversation existante
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les données du prompt et du modèle
    const {
      prompt,
      modelName = conversation.modelName,
      maxTokens = 512,
    } = await request.json();

    // Ajouter le message utilisateur à la conversation
    await addMessage(conversationId, {
      role: "student",
      content: prompt,
    });

    // Récupérer l'historique des messages pour le contexte
    const messageHistory = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Générer une réponse IA en utilisant l'API appropriée (OpenAI ou Mistral)
    const {
      content: aiResponse,
      tokenCount,
      modelUsed,          // ✅ on récupère le modèle réellement utilisé
    } = await generateAIResponse(
      prompt,
      modelName,
      messageHistory,
      maxTokens
    );

    // Ajouter la réponse IA à la conversation avec le vrai modèle utilisé
    const updatedConversation = await addMessage(conversationId, {
      role: "assistant",
      content: aiResponse,
      tokenCount,
      modelUsed: modelUsed || modelName, // ✅ fallback au cas où
    });

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
      aiResponse,
    });
  } catch (err: unknown) {
    console.error("Erreur de réponse IA:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
