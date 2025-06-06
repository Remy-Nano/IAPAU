// src/app/api/users/me/route.ts
import { IUser, User } from "@/lib/models/user";
import { connectToDatabase } from "@/lib/mongoose";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Se connecter à MongoDB
  await connectToDatabase();

  // 2. Récupérer le header Authorization
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  // 3. Vérifier et décoder le JWT
  let payload: { sub: string; role: string };
  try {
    // On précise exactement la forme du payload
    interface JwtPayload {
      sub: string;
      role: string;
    }

    payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // 4. Récupérer l’utilisateur depuis la base
  const user = await User.findById(payload.sub).lean<IUser>();
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }

  // 5. Supprimer le champ passwordHash
  delete (user as Partial<IUser>).passwordHash;

  // 6. Retourner l’objet user
  return NextResponse.json({ user }, { status: 200 });
}
