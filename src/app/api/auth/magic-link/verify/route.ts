// src/app/api/auth/magic-link/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import { User } from "@/lib/models/user";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

type JwtPayload = {
  email?: string;
  iat?: number;
  exp?: number;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const acceptsHtml = req.headers.get("accept")?.includes("text/html");
    const isDocumentRequest =
      req.headers.get("sec-fetch-dest") === "document" ||
      req.headers.get("sec-fetch-mode") === "navigate" ||
      req.headers.get("upgrade-insecure-requests") === "1";
    const isFetchRequest =
      req.headers.get("sec-fetch-mode") === "cors" ||
      req.headers.get("sec-fetch-dest") === "empty";

    if (!token) {
      if (process.env.E2E_TESTING === "true" && acceptsHtml) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // ✅ E2E: si navigation navigateur, redirige vers la page front sans consommer le token
    if (
      process.env.E2E_TESTING === "true" &&
      (acceptsHtml || isDocumentRequest) &&
      !isFetchRequest
    ) {
      return NextResponse.redirect(
        new URL(`/magic-link/verify?token=${token}`, req.url)
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const email = decoded.email;
    if (!email) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Vérifie que le token correspond à celui stocké en DB
    const stored = user.magicLink?.token;
    const expiresAt = user.magicLink?.expiresAt ? new Date(user.magicLink.expiresAt) : null;

    if (!stored || stored !== token) {
      return NextResponse.json({ error: "Token non reconnu" }, { status: 401 });
    }

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Token expiré" }, { status: 401 });
    }

    // Ici, on peut générer un "token de session" (ex: 1h)
    const sessionToken = jwt.sign(
      { sub: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Optionnel: invalider le magic link après usage
    await User.findByIdAndUpdate(user._id, {
      "magicLink.token": "",
      "magicLink.expiresAt": new Date(0),
    });

    // Retirer le hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutHash } = user.toObject();

    return NextResponse.json(
      { token: sessionToken, user: userWithoutHash },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
