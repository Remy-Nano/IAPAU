import { User } from "@/lib/models/user";
import connectDB from "@/lib/mongoose";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Variantes valides pour chaque rôle (FR + alias anglais)
const VALID = {
  etudiant: ["etudiant", "etudiants", "student", "students"] as string[],
  examinateur: [
    "examinateur",
    "examinateurs",
    "examiner",
    "examiners",
  ] as string[],
  admin: ["admin", "admins", "administrateur", "administrateurs"] as string[],
} as const;

type RoleKey =
  | "student"
  | "examiner"
  | "admin"
  | "etudiant"
  | "examinateur"
  | "";

function parseRole(raw: string): RoleKey {
  const n = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
  if (VALID.etudiant.includes(n)) return "etudiant";
  if (VALID.examinateur.includes(n)) return "examinateur";
  if (VALID.admin.includes(n)) return "admin";
  return "";
}

function generatePassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // Traitement multipart form-data pour récupérer le fichier CSV
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni" },
        { status: 400 }
      );
    }

    // Vérification du type de fichier
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Le fichier doit être au format CSV" },
        { status: 400 }
      );
    }

    // Lecture du contenu du fichier
    const content = await file.text();
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Le fichier CSV est vide ou ne contient que des en-têtes" },
        { status: 400 }
      );
    }

    // Extraction des en-têtes et des données
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredColumns = ["nom", "prenom", "email"];

    // Vérification des colonnes obligatoires
    for (const col of requiredColumns) {
      if (!headers.includes(col)) {
        return NextResponse.json(
          { error: `Le fichier CSV doit contenir la colonne "${col}"` },
          { status: 400 }
        );
      }
    }

    // Mapping des colonnes
    const colIndexes = {
      nom: headers.indexOf("nom"),
      prenom: headers.indexOf("prenom"),
      email: headers.indexOf("email"),
      role: headers.indexOf("role"),
      numeroEtudiant: headers.indexOf("numeroetudiant"),
      dateNaissance: headers.indexOf("datenaissance"),
    };

    // Traitement des lignes de données
    const results = {
      imported: 0,
      errors: [] as string[],
      warnings: [] as string[],
    };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      // Skip si pas assez de colonnes
      if (values.length < 3) {
        results.errors.push(`Ligne ${i + 1}: pas assez de colonnes`);
        continue;
      }

      // Extraction des données
      const userData = {
        nom: values[colIndexes.nom],
        prenom: values[colIndexes.prenom],
        email: values[colIndexes.email],
        role:
          colIndexes.role >= 0 ? parseRole(values[colIndexes.role]) : "student",
        numeroEtudiant:
          colIndexes.numeroEtudiant >= 0
            ? values[colIndexes.numeroEtudiant]
            : "",
        dateNaissance: undefined as Date | undefined,
      };

      // Validation des données obligatoires
      if (!userData.nom || !userData.prenom || !userData.email) {
        results.errors.push(`Ligne ${i + 1}: nom, prénom et email sont requis`);
        continue;
      }

      // Parsing de la date si fournie
      if (colIndexes.dateNaissance >= 0 && values[colIndexes.dateNaissance]) {
        try {
          const dateStr = values[colIndexes.dateNaissance];
          userData.dateNaissance = new Date(dateStr);
          if (isNaN(userData.dateNaissance.getTime())) {
            results.warnings.push(
              `Ligne ${i + 1}: format de date invalide, ignoré`
            );
            userData.dateNaissance = undefined;
          }
        } catch {
          results.warnings.push(
            `Ligne ${i + 1}: format de date invalide, ignoré`
          );
        }
      }

      // Génération d'un mot de passe aléatoire
      const password = generatePassword();
      const passwordHash = await bcrypt.hash(password, 10);

      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          results.warnings.push(
            `Ligne ${i + 1}: l'utilisateur avec l'email ${
              userData.email
            } existe déjà, ignoré`
          );
          continue;
        }

        // Création de l'utilisateur
        await User.create({
          ...userData,
          passwordHash,
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

        results.imported++;
      } catch (error) {
        console.error(error);
        results.errors.push(
          `Ligne ${i + 1}: erreur lors de la création de l'utilisateur`
        );
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement du fichier" },
      { status: 500 }
    );
  }
}
