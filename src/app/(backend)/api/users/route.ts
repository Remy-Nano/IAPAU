import connectDB from "@/lib/mongoose";
import { createUser, getAllUsers } from "@/lib/services/userService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const newUser = await createUser(data);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Erreur lors de la création de l'utilisateur:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la création de l'utilisateur";
    const status =
      error instanceof Error && error.message.includes("déjà utilisé")
        ? 409
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
