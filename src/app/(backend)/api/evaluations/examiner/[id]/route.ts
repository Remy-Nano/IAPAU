import { Evaluation } from "@/lib/models/evaluation";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    console.log("=== API EVALUATIONS START ===");

    await connectDB();
    console.log("✅ Database connected");

    const resolvedParams = await params;
    const examinerId = resolvedParams.id;

    // Récupérer les paramètres hackathonId et tacheId depuis les query params
    const url = new URL(request.url);
    const hackathonId = url.searchParams.get("hackathonId");
    const tacheId = url.searchParams.get("tacheId");

    console.log("📋 Examiner ID:", examinerId);
    console.log("🏆 Hackathon ID filter:", hackathonId || "none");
    console.log("📋 Tache ID filter:", tacheId || "none");

    // Construire la requête avec filtrage optionnel par hackathon et tâche
    const query: {
      examinerId: string;
      hackathonId?: string;
      tacheId?: string;
    } = { examinerId };

    if (hackathonId && hackathonId !== "all") {
      query.hackathonId = hackathonId;
    }

    if (tacheId && tacheId !== "all") {
      query.tacheId = tacheId;
    }

    console.log("🔍 Query:", JSON.stringify(query));

    const evaluations = await Evaluation.find(query)
      .sort({ gradedAt: -1 })
      .lean();

    console.log("📊 Found evaluations:", evaluations.length);
    console.log("=== API EVALUATIONS END ===");

    return NextResponse.json(
      {
        success: true,
        evaluations: evaluations,
        debug: {
          examinerId,
          hackathonId: hackathonId || "all",
          tacheId: tacheId || "all",
          totalFound: evaluations.length,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ API ERROR:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
