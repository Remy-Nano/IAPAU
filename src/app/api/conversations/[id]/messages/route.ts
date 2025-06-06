// src/app/api/conversations/[id]/messages/route.ts
import { addMessage } from "@/lib/controllers/conversationController";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function POST(request: Request, { params }: Params) {
  await connectToDatabase();
  const payload = await request.json();
  try {
    // Attendre les paramètres avant d'y accéder (requis dans Next.js 15)
    const resolvedParams = await params;
    const updated = await addMessage(resolvedParams.id, payload);
    if (!updated) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json({ conversation: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
