import { connectToDatabase } from "@/lib/mongoose";
import { createEvaluation } from "@/lib/services/evaluationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();

    console.log("DEBUG API - Received data:", {
      conversationId: data.conversationId,
      studentId: data.studentId,
      examinerId: data.examinerId,
      note: data.note,
      comment: data.comment?.substring(0, 50) + "...",
    });

    const evaluation = await createEvaluation(data);

    console.log("DEBUG API - Evaluation created:", evaluation._id);
    console.log("DEBUG API - With hackathonId:", evaluation.hackathonId);
    console.log("DEBUG API - With tacheId:", evaluation.tacheId);

    return NextResponse.json({ success: true, evaluation }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur lors de la création de l'évaluation:", error);

    // Gestion du conflit d'index unique (E11000)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          error:
            "Une évaluation existe déjà pour cette combinaison examinateur/conversation",
        },
        { status: 409 }
      );
    }

    // Erreurs de validation Mongoose
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      const validationError = error as unknown as {
        errors: Record<string, { message: string }>;
      };
      const messages = Object.values(validationError.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: `Erreur de validation: ${messages.join(", ")}` },
        { status: 400 }
      );
    }

    // Erreur de service (validation métier)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Erreur générale
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
