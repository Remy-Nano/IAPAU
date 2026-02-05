import { getConversationsByStudent } from "@/lib/controllers/conversationController";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, context: Context) {
  try {
    // Dans Next.js 15, params peut être une promesse
    const params = await context.params;
    const id = params.id;

    const url = new URL(request.url);
    const includeMessages = url.searchParams.get("includeMessages") === "true";

    await connectDB();
    const conversations = await getConversationsByStudent(id);

    // Si on ne veut pas inclure les messages, on les filtre
    const filteredConversations = conversations.map((convo) => {
      const result = { ...convo };

      if (!includeMessages && result.messages) {
        // Garder seulement le premier message pour l'aperçu
        result.messages = result.messages.slice(0, 1);
      }

      return result;
    });

    return NextResponse.json({
      success: true,
      conversations: filteredConversations,
    });
  } catch (err: unknown) {
    console.error("Erreur lors de la récupération des conversations:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
