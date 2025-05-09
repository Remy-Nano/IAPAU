import { User } from "@/lib/models/user";
import connectDB from "@/lib/mongoose";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function normalizeRole(
  raw: string
): "student" | "examiner" | "admin" | "etudiant" | "examinateur" | "" {
  const r = raw.trim().toLowerCase();
  if (["etudiant", "student"].includes(r))
    return r === "etudiant" ? "etudiant" : "student";
  if (["examinateur", "examiner"].includes(r))
    return r === "examinateur" ? "examinateur" : "examiner";
  if (["admin", "administrateur"].includes(r)) return "admin";
  return "";
}

export async function GET() {
  await connectDB();
  const users = await User.find().lean();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const {
      prenom,
      nom,
      email,
      password,
      dateNaissance: dateStr,
      role,
      numeroEtudiant,
    } = await request.json();

    // Vérification des champs obligatoires
    if (!prenom || !nom || !email || !password) {
      return NextResponse.json(
        { error: "Prénom, nom, email et mot de passe sont requis" },
        { status: 400 }
      );
    }

    // Vérification si l'email existe déjà
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json(
        { error: `L'email ${email} est déjà utilisé` },
        { status: 409 }
      );
    }

    // Parsing de la date si fournie
    let dateNaissance = undefined;
    if (dateStr) {
      dateNaissance = new Date(dateStr);
      if (isNaN(dateNaissance.getTime())) {
        return NextResponse.json(
          { error: "Date de naissance invalide" },
          { status: 400 }
        );
      }
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);
    const roleKey = normalizeRole(role ?? "");

    // Création de l'utilisateur
    const newUser = await User.create({
      prenom,
      nom,
      email,
      dateNaissance,
      passwordHash,
      role: roleKey || "student", // Valeur par défaut
      numeroEtudiant: numeroEtudiant || "",
      tokensAuthorized: 0,
      tokensUsed: 0,
      magicLink: { token: "", expiresAt: new Date() },
      profilEtudiant: { niveauFormation: "", typeEtude: "", groupId: null },
      profilJury: {
        niveauDiplome: "",
        posteOccupe: "",
        secteurActivite: "",
        anneesExperience: 0,
        nombreETPEmployeur: 0,
        expertises: [],
      },
      consentementRGPD: false,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
