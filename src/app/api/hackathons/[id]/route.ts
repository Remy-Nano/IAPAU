import {
  deleteHackathon,
  getHackathonById,
  updateHackathon,
} from "@/lib/controllers/hackathonController";
import connectDB from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: Props) {
  await connectDB();
  try {
    const id = params.id;
    console.log(`GET /api/hackathons/${id}`);
    const hackathon = await getHackathonById(id);
    return NextResponse.json(hackathon, { status: 200 });
  } catch (err: unknown) {
    console.error(`Erreur GET /api/hackathons/${params.id}:`, err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    const status = msg === "Hackathon non trouvé" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  await connectDB();
  try {
    const id = params.id;
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
    console.error(`Erreur PATCH /api/hackathons/${params.id}:`, err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    const status = msg === "Hackathon non trouvé" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  await connectDB();
  try {
    const id = params.id;
    console.log(`DELETE /api/hackathons/${id}`);
    await deleteHackathon(id);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    console.error(`Erreur DELETE /api/hackathons/${params.id}:`, err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    const status = msg === "Hackathon non trouvé" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
