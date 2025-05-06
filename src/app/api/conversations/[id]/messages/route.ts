// src/app/api/conversations/[id]/messages/route.ts
import { addMessage } from "@/lib/controllers/conversationController";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function POST(request: Request, { params }: Params) {
  await connectDB();
  const payload = await request.json();
  try {
    const updated = await addMessage(params.id, payload);
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
