import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Variantes valides pour chaque rôle (FR + alias anglais)
const VALID = {
  etudiant:    ["etudiant","etudiants","student","students"],
  examinateur: ["examinateur","examinateurs","examiner","examiners"],
  admin:       ["admin","admins","administrateur","administrateurs"],
} as const;

type RoleKey = "" | "etudiant" | "examinateur" | "admin";

function parseRole(raw: string): RoleKey {
  const n = raw.trim().toLowerCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g,"")
               .replace(/[^a-z]/g,"");
  if (VALID.etudiant.includes(n as any))    return "etudiant";
  if (VALID.examinateur.includes(n as any)) return "examinateur";
  if (VALID.admin.includes(n as any))       return "admin";
  return "";
}

export async function POST(request: Request) {
  await connectToDatabase();
  const rows = (await request.json()) as Array<{
    prenom: string;
    nom: string;
    email: string;
    password: string;
    dateNaissance: string;
    numeroEtudiant?: string;
    role?: string;
  }>;

  let inserted = 0, updated = 0;
  const errors: string[] = [];

  for (const s of rows) {
    // 1) Champs requis
    if (!s.prenom || !s.nom || !s.email || !s.password || !s.dateNaissance) {
      errors.push(`Ligne incomplète pour ${s.prenom} ${s.nom}`);
      continue;
    }

    const roleKey = parseRole(s.role ?? "");
    const birth   = new Date(s.dateNaissance);
    const pwdHash = await bcrypt.hash(s.password, 10);

    // 2) Upsert par identité
    const existing = await User.findOne({
      prenom: s.prenom,
      nom: s.nom,
      dateNaissance: birth,
    });

    if (existing) {
      let dirty = false;
      // email
      if (existing.email !== s.email) {
        if (await User.exists({ email: s.email, _id: { $ne: existing._id } })) {
          errors.push(`Email déjà pris pour ${s.prenom} ${s.nom}`);
          continue;
        }
        existing.email = s.email;
        dirty = true;
      }
      // rôle (si reconnu)
      if (roleKey && existing.role !== roleKey) {
        existing.role = roleKey;
        dirty = true;
      }
      // numéro étudiant
      if (s.numeroEtudiant && existing.numeroEtudiant !== s.numeroEtudiant) {
        existing.numeroEtudiant = s.numeroEtudiant;
        dirty = true;
      }
      // mot de passe
      existing.passwordHash = pwdHash;
      dirty = true;

      if (dirty) {
        await existing.save();
        updated++;
      }
    } else {
      // 3) Création
      if (await User.exists({ email: s.email })) {
        errors.push(`Email déjà pris (nouveau) pour ${s.prenom} ${s.nom}`);
        continue;
      }
      await User.create({
        prenom:           s.prenom,
        nom:              s.nom,
        email:            s.email,
        dateNaissance:    birth,
        passwordHash:     pwdHash,
        role:             roleKey,
        numeroEtudiant:   s.numeroEtudiant || "",
        tokensAuthorized: 0,
        tokensUsed:       0,
        magicLink:        { token: "", expiresAt: new Date() },
        profilEtudiant:   { niveauFormation: "", typeEtude: "", groupId: null },
        profilJury:       {
          niveauDiplome:      "",
          posteOccupe:        "",
          secteurActivite:    "",
          anneesExperience:   0,
          nombreETPEmployeur: 0,
          expertises:         [],
        },
        consentementRGPD: false,
      });
      inserted++;
    }
  }

  return NextResponse.json(
    { inserted, updated, errors },
    { status: errors.length === 0 ? 201 : 207 }
  );
}
