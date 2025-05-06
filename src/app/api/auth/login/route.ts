// src/app/api/auth/login/route.ts
import { login, type LoginPayload } from "@/lib/controllers/authController";
import connectDB from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. Connecte-toi à MongoDB
  await connectDB();

  // 2. Récupère email & password
  let payload: LoginPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 }
    );
  }

  // 3. Appelle le controller
  try {
    const result = await login(payload);
    // 4. Retourne { token, user }
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    // On n’utilise plus `any`, on vérifie si c’est une Error
    const message =
      error instanceof Error ? error.message : "Erreur d’authentification";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
