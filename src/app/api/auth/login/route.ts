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

// Vérifier que JWT_SECRET est défini
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Début de la requête de connexion");

    const body = await req.json();
    const { email } = loginSchema.parse(body);
    console.log("Email reçu:", email);

    // 1. Connecte-toi à MongoDB
    await connectDB();
    console.log("✅ Connexion MongoDB réussie");

    // 2. Vérifie l'utilisateur
    let user = await User.findOne({ email });
    console.log("Recherche de l'utilisateur terminée");

    if (!user) {
      // Créer automatiquement l'utilisateur pour matheoalves030@gmail.com
      if (email === "matheoalves030@gmail.com") {
        console.log(
          "🔧 Création automatique de l'utilisateur matheoalves030@gmail.com"
        );
        user = new User({
          prenom: "Matheo",
          nom: "Alves",
          email: "matheoalves030@gmail.com",
          passwordHash: "auto_created_user", // Dummy value pour le magic link
          role: "etudiant",
          tokensAuthorized: 100,
          tokensUsed: 0,
          consentementRGPD: true,
        });
        await user.save();
        console.log("✅ Utilisateur créé automatiquement");
      }
      // Créer automatiquement l'utilisateur pierre.durand@example.fr
      else if (email === "pierre.durand@example.fr") {
        console.log(
          "🔧 Création automatique de l'utilisateur pierre.durand@example.fr"
        );
        user = new User({
          prenom: "Pierre",
          nom: "Durand",
          email: "pierre.durand@example.fr",
          passwordHash:
            "$2b$10$yM1/w4uJl.m0p0LobiL6gOcbn4/50UqqYDRsrk6gB717W0U0es0km", // Hash de 'examiner123'
          role: "examinateur",
          tokensAuthorized: 0,
          tokensUsed: 0,
          consentementRGPD: true,
        });
        await user.save();
        console.log("✅ Utilisateur examinateur créé automatiquement");
      } else {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
    }

    if (!user.role) {
      return NextResponse.json(
        { error: "Rôle utilisateur invalide" },
        { status: 400 }
      );
    }

    // 3. Pour les étudiants, génère un token JWT et envoie le lien magique
    if (user.role === "etudiant" || user.role === "student") {
      console.log("✅ Utilisateur est étudiant, génération du token...");
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: "10m",
        algorithm: "HS256",
      });
      console.log("Token JWT généré:", token);

      await User.findByIdAndUpdate(user._id, {
        "magicLink.token": token,
        "magicLink.expiresAt": new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });
      console.log("✅ Token sauvegardé dans la base de données");

      // Construire l'URL du lien magique
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
      const magicLink = `${baseUrl}/magic-link/verify?token=${token}`;
      console.log("Lien magique généré:", magicLink);

      // Envoyer l'email avec le lien magique
      try {
        console.log("⚡ Tentative d'envoi de l'email...");
        await sendMagicLink(email, magicLink);
        console.log("✅ Email envoyé avec succès");
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'email:", error);
        throw error instanceof Error
          ? error
          : new Error("Erreur lors de l'envoi de l'email");
      }
    } else {
      console.log("ℹ️ Utilisateur n'est pas étudiant, pas d'email à envoyer");
    }

    // 4. Retourne le rôle
    return NextResponse.json({ role: user.role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Erreur de validation:", error);
      return NextResponse.json(
        {
          error: error.errors[0]?.message || "Données invalides",
        },
        { status: 400 }
      );
    }

    console.error("❌ Erreur lors de la connexion:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
