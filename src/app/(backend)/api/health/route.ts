// src/app/api/health/route.ts
import connectDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json(
      { status: "ok", mongoState: mongoose.connection.readyState },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}
