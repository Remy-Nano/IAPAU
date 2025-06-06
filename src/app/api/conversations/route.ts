// src/app/api/conversations/route.ts
import { createConversation } from "@/lib/controllers/conversationController";
import { connectToDatabase } from "@/lib/mongoose";
import { getConversationsWithFilters } from "@/lib/services/conversationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const data = await request.json();
  try {
    const convo = await createConversation(data);
    return NextResponse.json({ conversation: convo }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET(request: Request) {
  await connectToDatabase();
  try {
    const url = new URL(request.url);
    const withFinalVersion =
      url.searchParams.get("withFinalVersion") === "true";
    const hackathonId = url.searchParams.get("hackathonId");
    const tacheId = url.searchParams.get("tacheId");

    const conversations = await getConversationsWithFilters({
      withFinalVersion,
      hackathonId: hackathonId || undefined,
      tacheId: tacheId || undefined,
    });

    return NextResponse.json({ success: true, conversations });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
