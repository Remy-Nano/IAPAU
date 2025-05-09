import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

function normalizeRole(raw: string): "" | "etudiant" | "examinateur" | "admin" {
  const r = raw.trim().toLowerCase();
  if (["etudiant", "student"].includes(r))      return "etudiant";
  if (["examinateur", "examiner"].includes(r))  return "examinateur";
  if (["admin", "administrateur"].includes(r))  return "admin";
  return "";
}

export async function GET() {
  await connectToDatabase();
  const users = await User.find().lean();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const {
    prenom,
    nom,
    email,
    password,
    dateNaissance: dateStr,
    role,
    numeroEtudiant,
  } = await request.json();

  // 1) Champs obligatoires
  if (!prenom || !nom || !email || !password || !dateStr) {
    return NextResponse.json(
      { error: "Prénom, nom, email, mot de passe et date de naissance sont requis" },
      { status: 400 }
    );
  }

  // 2) Parsing date
  const dateNaissance = new Date(dateStr);
  if (isNaN(dateNaissance.getTime())) {
    return NextResponse.json({ error: "Date de naissance invalide" }, { status: 400 });
  }

  // 3) Hash et normalisation rôle
  const passwordHash = await bcrypt.hash(password, 10);
  const roleKey      = normalizeRole(role ?? "");

  // 4) Upsert par email ou par identité
  const byEmail = await User.findOne({ email });
  if (byEmail) {
    // si même identité, maj
    if (
      byEmail.prenom === prenom &&
      byEmail.nom === nom &&
      byEmail.dateNaissance.toISOString().slice(0,10) === dateStr
    ) {
      const updated = await User.findByIdAndUpdate(
        byEmail._id,
        {
          prenom,
          nom,
          passwordHash,
          ...(roleKey && { role: roleKey }),
          numeroEtudiant: numeroEtudiant || "",
        },
        { new: true }
      ).lean();
      return NextResponse.json(updated);
    }
    // sinon, conflit d'email
    return NextResponse.json(
      { error: `L'email ${email} est déjà utilisé` },
      { status: 409 }
    );
  }

  // recherche par identité (nom+prenom+date)
  const existing = await User.findOne({ prenom, nom, dateNaissance });
  if (existing) {
    const updated = await User.findByIdAndUpdate(
      existing._id,
      {
        email,
        passwordHash,
        ...(roleKey && { role: roleKey }),
        numeroEtudiant: numeroEtudiant || "",
      },
      { new: true }
    ).lean();
    return NextResponse.json(updated);
  }

  // 5) Création
  const newUser = await User.create({
    prenom,
    nom,
    email,
    dateNaissance,
    passwordHash,
    role: roleKey,
    numeroEtudiant: numeroEtudiant || "",
    tokensAuthorized: 0,
    tokensUsed: 0,
    magicLink: { token: "", expiresAt: new Date() },
    profilEtudiant: { niveauFormation: "", typeEtude: "", groupId: null },
    profilJury: {
      niveauDiplome: "", posteOccupe: "", secteurActivite: "",
      anneesExperience: 0, nombreETPEmployeur: 0, expertises: [],
    },
    consentementRGPD: false,
  });

  return NextResponse.json(newUser, { status: 201 });
}
