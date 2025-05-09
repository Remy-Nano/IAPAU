import {
  createHackathon,
  getAllHackathons,
} from "@/lib/controllers/hackathonController";
import connectDB from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const hackathons = await getAllHackathons();
    return NextResponse.json(hackathons, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const data = await request.json();
    console.log(
      "POST /api/hackathons - Données reçues:",
      JSON.stringify(data, null, 2)
    );

    // Validation simple
    if (!data.nom) {
      console.log("Validation échouée: nom absent");
      return NextResponse.json(
        { error: "Le nom du hackathon est requis" },
        { status: 400 }
      );
    }

    // Vérification des dates
    if (!data.dates || !data.dates.debut || !data.dates.fin) {
      console.log("Validation échouée: dates incomplètes");
      return NextResponse.json(
        { error: "Les dates de début et de fin sont requises" },
        { status: 400 }
      );
    }

    const result = await createHackathon(data);
    console.log("Hackathon créé avec succès, id:", result._id);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    console.error("Erreur lors de la création du hackathon:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
