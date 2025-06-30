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
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const magicLink = `${baseUrl}/magic-link/verify?token=${token}`;
      console.log("Lien magique généré:", magicLink);

      // Envoyer l'email avec le lien magique
      try {
        console.log("⚡ Tentative d'envoi de l'email...");

        await sendMagicLink(email, magicLink);

        console.log("✅ Email envoyé avec succès à", email);
        console.log("🔗 Lien magique (aussi envoyé par email):", magicLink);
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'email:", error);

        // En cas d'erreur email, afficher le lien dans les logs pour debug
        console.log("🔗 LIEN MAGIQUE (FALLBACK - copie dans ton navigateur):");
        console.log("   " + magicLink);

        // Ne pas faire échouer la connexion si l'email ne part pas
        console.log("⚠️ Connexion autorisée malgré l'échec email");
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
