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

export async function GET(request: Request) {
  await connectDB();
  try {
    const url = new URL(request.url);
    const withFinalVersion =
      url.searchParams.get("withFinalVersion") === "true";
    const hackathonId = url.searchParams.get("hackathonId");
    const tacheId = url.searchParams.get("tacheId");

    const query: {
      $and?: Array<Record<string, unknown>>;
      hackathonId?: string;
      tacheId?: string;
    } = {};

    // Filtrer les conversations avec versionFinale non vide
    if (withFinalVersion) {
      query.$and = [
        { "versionFinale.promptFinal": { $exists: true, $ne: "" } },
        { "versionFinale.reponseIAFinale": { $exists: true, $ne: "" } },
      ];
    }

    // Filtrer par hackathon si spécifié
    if (hackathonId && hackathonId !== "all") {
      query.hackathonId = hackathonId;
    }

    // Filtrer par tâche si spécifié
    if (tacheId && tacheId !== "all") {
      query.tacheId = tacheId;
    }

    const conversations = await Conversation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, conversations });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
