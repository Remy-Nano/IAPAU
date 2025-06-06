import { User } from "@/lib/models/user";
import { connectToDatabase } from "@/lib/mongoose";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const id = params.id;
    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const id = params.id;

    // Si un mot de passe est fourni, on le hashe
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password; // On ne stocke pas le mot de passe en clair
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (data.email) {
      const existingUser = await User.findOne({
        email: data.email,
        _id: { $ne: id },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error: `L'email ${data.email} est déjà utilisé par un autre utilisateur`,
          },
          { status: 409 }
        );
      }
    }

    const updated = await User.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const id = params.id;
    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      deleted: true,
      message: `L'utilisateur a été supprimé avec succès`,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
