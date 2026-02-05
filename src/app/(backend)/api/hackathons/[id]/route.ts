import {
  deleteHackathon,
  getHackathonById,
  updateHackathon,
} from "@/lib/controllers/hackathonController";
import connectDB from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  await connectDB();
  try {
    const { id } = await params;
    const hackathon = await getHackathonById(id);

    // Vérifier si on demande uniquement les tâches
    const url = new URL(request.url);
    const tasksOnly = url.searchParams.get("tasksOnly") === "true";

    if (tasksOnly) {
      // Retourner seulement les tâches formatées
      const formattedTasks = hackathon.taches.map((tache, index) => ({
        id: `${id}-task-${index}`, // ID unique pour chaque tâche
        nom: tache,
        hackathonId: id,
      }));

      return NextResponse.json({ success: true, taches: formattedTasks });
    }

    return NextResponse.json(hackathon);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  await connectDB();
  try {
    const { id } = await params;
    console.log(`PATCH /api/hackathons/${id}`);
    const data = await request.json();

    // Validation simple
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée fournie pour la mise à jour" },
        { status: 400 }
      );
    }

    const updated = await updateHackathon(id, data);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    const { id } = await params;
    console.error(`Erreur PATCH /api/hackathons/${id}:`, err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    const status = msg === "Hackathon non trouvé" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  await connectDB();
  try {
    const { id } = await params;
    console.log(`DELETE /api/hackathons/${id}`);
    await deleteHackathon(id);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const { id } = await params;
    console.error(`Erreur DELETE /api/hackathons/${id}:`, err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    const status = msg === "Hackathon non trouvé" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
