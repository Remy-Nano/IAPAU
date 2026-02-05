import { generateAIResponse, streamAIResponse } from "@/lib/ai-service";
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

    const url = new URL(request.url);
    const isStream = url.searchParams.get("stream") === "1";

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

    if (isStream) {
      const encoder = new TextEncoder();
      const { stream, modelUsed } = await streamAIResponse(
        prompt,
        modelName,
        messageHistory,
        maxTokens
      );

      let fullResponse = "";
      let totalTokens: number | undefined;

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              const content = event?.data?.choices?.[0]?.delta?.content;
              const usageTotal = event?.data?.usage?.totalTokens;
              if (typeof usageTotal === "number") {
                totalTokens = usageTotal;
              }
              if (!content) continue;
              fullResponse += content;
              const payload = JSON.stringify({ type: "delta", content });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }

            await addMessage(conversationId, {
              role: "assistant",
              content: fullResponse,
              tokenCount: totalTokens,
              modelUsed: modelUsed || modelName,
            });

            if (typeof totalTokens === "number") {
              const usagePayload = JSON.stringify({
                type: "usage",
                totalTokens,
              });
              controller.enqueue(encoder.encode(`data: ${usagePayload}\n\n`));
            }

            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            const payload = JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : "Erreur inconnue",
            });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    } else {
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
    }
  } catch (err: unknown) {
    console.error("Erreur de réponse IA:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
