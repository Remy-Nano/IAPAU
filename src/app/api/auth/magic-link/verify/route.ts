import { User } from "@/lib/models/user";
import connectDB from "@/lib/mongoose";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ "magicLink.token": token });

    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 });
    }

    if (user.magicLink?.expiresAt && user.magicLink.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token expiré" }, { status: 400 });
    }

    // Réinitialiser le token après utilisation
    if (user._id) {
      await User.findByIdAndUpdate(user._id, {
        "magicLink.token": "",
        "magicLink.expiresAt": new Date(),
      });
    }

    // Vérifier la validité du token JWT
    jwt.verify(token, process.env.JWT_SECRET!);

    // Retourner les infos utilisateur au lieu de rediriger
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du lien magique:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
