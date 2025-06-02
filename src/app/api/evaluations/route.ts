import { Evaluation } from "@/lib/models/evaluation";
import connectDB from "@/lib/mongoose";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { conversationId, studentId, examinerId, note, comment } =
      await request.json();

    // Validation des champs obligatoires
    if (!conversationId || !studentId || !examinerId || !note || !comment) {
      return NextResponse.json(
        {
          error:
            "Tous les champs sont requis : conversationId, studentId, examinerId, note, comment",
        },
        { status: 400 }
      );
    }

    // Validation de la note
    if (typeof note !== "number" || note < 1 || note > 10) {
      return NextResponse.json(
        { error: "La note doit être un nombre entre 1 et 10" },
        { status: 400 }
      );
    }

    // Validation du commentaire
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Le commentaire ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Validation des ObjectId
    if (
      !Types.ObjectId.isValid(conversationId) ||
      !Types.ObjectId.isValid(studentId) ||
      !Types.ObjectId.isValid(examinerId)
    ) {
      return NextResponse.json(
        { error: "Les IDs fournis ne sont pas valides" },
        { status: 400 }
      );
    }

    // Création de l'évaluation
    const evaluation = await Evaluation.create({
      conversationId,
      studentId,
      examinerId,
      note,
      comment: comment.trim(),
    });

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

    // Erreur générale
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
