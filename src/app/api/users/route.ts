import { register, RegisterPayload } from "@/lib/controllers/usrController";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectDB();
  try {
    const data: RegisterPayload = await request.json();

    // Validation des données
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const result = await register(data);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const users = await (await import("@/lib/models/user")).User.find()
      .select("-passwordHash")
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
