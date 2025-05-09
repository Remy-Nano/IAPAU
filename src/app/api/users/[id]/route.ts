// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const data = await request.json();
  const updated = await User.findByIdAndUpdate(params.id, data, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const deleted = await User.findByIdAndDelete(params.id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
