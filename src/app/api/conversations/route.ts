// src/app/api/conversations/route.ts
import { createConversation } from "@/lib/controllers/conversationController";
import { Conversation } from "@/lib/models/conversation";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectDB();
  const data = await request.json();
  try {
    const convo = await createConversation(data);
    return NextResponse.json({ conversation: convo }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const conversations = await Conversation.find().lean();
    return NextResponse.json({ success: true, conversations });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
