import {
  createHackathon,
  getAllHackathons,
} from "@/lib/controllers/hackathonController";
import { connectToDatabase } from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  console.log("📥 GET /api/hackathons - Début de la requête");
  try {
    console.log("🔌 Connexion à la base de données...");
    await connectToDatabase();
    console.log("✅ Connexion DB réussie, récupération des hackathons...");

    const hackathons = await getAllHackathons();
    console.log(`✅ ${hackathons.length} hackathons récupérés avec succès`);

    return NextResponse.json(hackathons, { status: 200 });
  } catch (err: unknown) {
    console.error("❌ Erreur GET /api/hackathons:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";

    // Log plus détaillé pour le débogage
    if (err instanceof Error) {
      console.error("Message d'erreur:", err.message);
      console.error("Stack trace:", err.stack);
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase();
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
