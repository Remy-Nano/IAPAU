// src/app/api/auth/login/route.ts
import { User } from "@/lib/models/user";
import connectDB from "@/lib/mongoose";
import { sendMagicLink } from "@/lib/utils/email";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Format email invalide").min(1, "Email requis"),
  password: z.string().min(1).optional(), // ✅ si présent => credentials
});

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    // ✅ 1) Si password présent => délègue à /api/auth/credentials
    if (password) {
      const res = await fetch(new URL("/api/auth/credentials", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    // ✅ 2) Si PAS de password => on renvoie au minimum le role (pour ton AuthManager)
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          error:
            "Utilisateur non trouvé. Contactez un administrateur pour créer votre compte.",
        },
        { status: 404 }
      );
    }

    if (!user.role) {
      return NextResponse.json(
        { error: "Rôle utilisateur invalide" },
        { status: 400 }
      );
    }

    const isStudent = user.role === "etudiant" || user.role === "student";
    const isE2E = process.env.E2E_TESTING === "true";

    // ✅ Admin / Examiner : email seul => juste role (ça marche comme ton code actuel)
    if (!isStudent) {
      return NextResponse.json({ role: user.role }, { status: 200 });
    }

    // ✅ Student : email seul => magic-link
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "10m",
      algorithm: "HS256",
    });

    await User.findByIdAndUpdate(user._id, {
      "magicLink.token": token,
      "magicLink.expiresAt": new Date(Date.now() + 10 * 60 * 1000),
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // ✅ IMPORTANT: en E2E, on renvoie un lien vers l'API verify (qui redirige)
    const magicLink = isE2E
      ? `${baseUrl}/api/auth/magic-link/verify?token=${token}`
      : `${baseUrl}/magic-link/verify?token=${token}`;

    // 🧪 E2E: on renvoie le lien
    if (isE2E) {
      return NextResponse.json(
        { role: user.role, token, magicLink },
        { status: 200 }
      );
    }

    // Dev/Prod: envoi email (fallback console)
    try {
      await sendMagicLink(email, magicLink);
    } catch (err) {
      console.error("❌ Erreur envoi email:", err);
      console.log("🔗 LIEN MAGIQUE (FALLBACK):", magicLink);
    }

    return NextResponse.json({ role: user.role }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}