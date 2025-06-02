import { Evaluation } from "@/lib/models/evaluation";
import connectDB from "@/lib/mongoose";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const examinerId = resolvedParams.id;

    // Validation de l'ObjectId
    if (!Types.ObjectId.isValid(examinerId)) {
      return NextResponse.json(
        { error: "ID examinateur invalide" },
        { status: 400 }
      );
    }

    // Récupération des évaluations avec population des données utiles
    const evaluations = await Evaluation.find({ examinerId })
      .populate("conversationId", "versionFinale createdAt")
      .sort({ gradedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, evaluations }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des évaluations:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
