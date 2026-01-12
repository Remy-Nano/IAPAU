// src/app/api/auth/credentials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongoose";
import { login } from "@/lib/controllers/authController";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { email, password } = schema.parse(body);

    // ✅ NORMALISATION
    email = email.trim().toLowerCase();

    await connectDB();

    const result = await login({ email, password });

    // ✅ On autorise uniquement admin/examiner/examinateur ici
    if (
      result.user.role !== "admin" &&
      result.user.role !== "examiner" &&
      result.user.role !== "examinateur"
    ) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json(
      {
        token: result.token,
        user: result.user,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}