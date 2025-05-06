// src/app/api/conversations/[id]/route.ts
import { getConversation } from "@/lib/controllers/conversationController";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  await connectDB();
  const convo = await getConversation(params.id);
  if (!convo) {
    return NextResponse.json(
      { error: "Conversation non trouvée" },
      { status: 404 }
    );
  }
  return NextResponse.json({ conversation: convo });
}
