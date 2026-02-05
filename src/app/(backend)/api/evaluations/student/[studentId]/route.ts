// src/app/api/evaluations/student/[studentId]/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Evaluation } from "@/lib/models/evaluation";

interface RouteParams {
  params: {
    studentId: string;
  };
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { studentId } = params;

  if (!studentId) {
    return NextResponse.json(
      { success: false, error: "studentId manquant dans l'URL" },
      { status: 400 }
    );
  }

  try {
    // 🔥 1. Connexion à Mongo
    await connectDB();

    console.log("🔍 Recherche des évaluations pour :", studentId);

    // 🔥 2. Récupérer les évaluations de CET étudiant
    const evaluations = await Evaluation.find({ studentId })
      .sort({ gradedAt: -1 })
      .lean()
      .exec();

    console.log("📊 Nombre d'évaluations trouvées :", evaluations.length);

    // 🔥 3. Réponse API
    return NextResponse.json(
      {
        success: true,
        evaluations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur récupération évaluations étudiant:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des évaluations",
      },
      { status: 500 }
    );
  }
}