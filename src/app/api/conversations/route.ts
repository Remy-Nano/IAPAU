// src/app/api/conversations/route.ts
import { createConversation } from "@/lib/controllers/conversationController";
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
