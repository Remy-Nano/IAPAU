// middleware.ts
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Exclure ces préfixes de la vérification
const PUBLIC_PATHS = ["/api/auth", "/api/health"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Si c’est une route publique, on laisse passer
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // On ne protège que /api/*
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  try {
    // Vérifie le JWT (throw si invalide)
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}

// Ne pas oublier de matcher toutes les routes API
export const config = {
  matcher: "/api/:path*",
};
