// src/app/api/conversations/[id]/route.ts
import {
  deleteConversation,
  getConversation,
} from "@/lib/controllers/conversationController";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(_: Request, { params }: Params) {
  await connectToDatabase();
  const resolvedParams = await params;
  const convo = await getConversation(resolvedParams.id);
  if (!convo) {
    return NextResponse.json(
      { error: "Conversation non trouvée" },
      { status: 404 }
    );
  }
  return NextResponse.json({ conversation: convo });
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const success = await deleteConversation(resolvedParams.id);

    if (success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: "Conversation non trouvée" },
        { status: 404 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
