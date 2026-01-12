import connectDB from "@/lib/mongoose";
import { createEvaluation } from "@/lib/services/evaluationService";
import { NextResponse } from "next/server";
import { Conversation } from "@/lib/models/conversation";
import type { IConversation } from "@/lib/models/conversation";

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();

    const { conversationId, examinerId, note, comment } = data;

    console.log("DEBUG API - Received data:", {
      conversationId,
      examinerId,
      note,
      comment: typeof comment === "string" ? comment.substring(0, 50) + "..." : comment,
    });

    // ✅ Validation minimale
    if (!conversationId || !examinerId || note === undefined || comment === undefined) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Champs manquants (conversationId, examinerId, note, comment requis)",
        },
        { status: 400 }
      );
    }

    const cleanComment = String(comment).trim();
    if (!cleanComment) {
      return NextResponse.json(
        { success: false, error: "Le commentaire est obligatoire" },
        { status: 400 }
      );
    }

    // ✅ 1) Récupérer la conversation (typée)
    const conversation = await Conversation.findById(conversationId)
      .lean<IConversation | null>()
      .exec();

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    if (!conversation.studentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de noter : cette conversation n'a pas de studentId",
        },
        { status: 400 }
      );
    }

    // ✅ 2) Créer l'évaluation (source de vérité = conversation)
    const payload = {
      conversationId,
      studentId: conversation.studentId,
      hackathonId: conversation.hackathonId ?? null,
      tacheId: conversation.tacheId ?? null,
      examinerId,
      note: Number(note),
      comment: cleanComment,
    };

    const evaluation = await createEvaluation(payload);

    console.log("DEBUG API - Evaluation created:", evaluation?._id);

    // ✅ 3) Envoi automatique au student → écrit dans la conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        "versionFinale.evaluationEtudiant": {
          note: Number(note),
          comment: cleanComment,
          examinerId,
          date: new Date(),
        },
      },
    }).exec();

    console.log("DEBUG API - Note envoyée à l’étudiant (Conversation updated)");

    return NextResponse.json({ success: true, evaluation }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur lors de la création de l'évaluation:", error);

    // Gestion du conflit d'index unique (E11000)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Une évaluation existe déjà pour cette combinaison examinateur/conversation",
        },
        { status: 409 }
      );
    }

    // ✅ Erreurs de validation Mongoose (safe)
if (
  error &&
  typeof error === "object" &&
  "name" in error &&
  (error as any).name === "ValidationError"
) {
  const mongooseError = error as any;

  const messages = mongooseError.errors
    ? Object.values(mongooseError.errors).map(
        (err: any) => err.message
      )
    : ["Erreur de validation Mongoose"];

  return NextResponse.json(
    {
      success: false,
      error: `Erreur de validation: ${messages.join(", ")}`,
    },
    { status: 400 }
  );
}

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}