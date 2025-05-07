// src/app/api/auth/login/route.ts
import { login, LoginPayload } from "@/lib/controllers/authController";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Connexion à la base
  await connectDB();

  // 2. Récupération du payload typé
  const body = (await request.json()) as LoginPayload;

  try {
    // 3. Appel du controller
    const result = await login(body);
    // 4. Succès : on renvoie le token et l’utilisateur
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    // 5. Gestion d’erreur sans any
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
