// src/app/api/auth/login/route.ts
import { User } from "@/lib/models/user";
import connectDB from "@/lib/mongoose";
import { sendMagicLink } from "@/lib/utils/email";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email invalide").min(1, "Email requis"),
});

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Début de la requête de connexion");

    const body = await req.json();
    const { email } = loginSchema.parse(body);
    console.log("Email reçu:", email);

    // 1) Connexion MongoDB
    await connectDB();
    console.log("✅ Connexion MongoDB réussie");

    // 2) Vérifie l'utilisateur
    const user = await User.findOne({ email });
    console.log("Recherche de l'utilisateur terminée");

    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé pour l'email: ${email}`);
      return NextResponse.json(
        {
          error:
            "Utilisateur non trouvé. Contactez un administrateur pour créer votre compte.",
        },
        { status: 404 }
      );
    }

    console.log(
      `✅ Utilisateur trouvé: ${user.prenom} ${user.nom} (${user.role})`
    );

    if (!user.role) {
      return NextResponse.json(
        { error: "Rôle utilisateur invalide" },
        { status: 400 }
      );
    }

    const isStudent = user.role === "etudiant" || user.role === "student";
    const isE2E = process.env.E2E_TESTING === "true";

    if (isStudent) {
      console.log("✅ Utilisateur est étudiant, génération du token...");

      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: "10m",
        algorithm: "HS256",
      });

      await User.findByIdAndUpdate(user._id, {
        "magicLink.token": token,
        "magicLink.expiresAt": new Date(Date.now() + 10 * 60 * 1000),
      });

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const magicLink = `${baseUrl}/magic-link/verify?token=${token}`;

      // ✅ MODE TEST : renvoie magicLink au lieu d’envoyer un email
      if (isE2E) {
        return NextResponse.json(
          { role: user.role, token, magicLink },
          { status: 200 }
        );
      }

      // Mode normal: email
      try {
        await sendMagicLink(email, magicLink);
      } catch (error) {
        console.error("❌ Erreur email:", error);
        console.log("🔗 LIEN MAGIQUE (FALLBACK):", magicLink);
      }

      return NextResponse.json({ role: user.role }, { status: 200 });
    }

    return NextResponse.json({ role: user.role }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
