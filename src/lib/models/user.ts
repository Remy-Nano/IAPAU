// src/lib/models/user.ts
import { Document, Schema, model, models } from "mongoose";

export interface IUser extends Document {
  prenom: string;
  nom: string;
  dateNaissance?: Date;
  email: string;
  numeroEtudiant?: string;
  passwordHash: string;
  // Garder les deux nomenclatures pour compatibilité
  role: "student" | "examiner" | "admin" | "etudiant" | "examinateur" | "";
  tokensAuthorized?: number;
  tokensUsed?: number;
  magicLink?: { token: string; expiresAt: Date };
  profilEtudiant?: {
    niveauFormation: string;
    typeEtude: string;
    groupId?: string;
  };
  profilJury?: {
    niveauDiplome: string;
    posteOccupe: string;
    secteurActivite: string;
    anneesExperience: number;
    nombreETPEmployeur: number;
    expertises: { domaine: string; niveauAutoEvaluation: number }[];
  };
  consentementRGPD?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    prenom: { type: String, required: true },
    nom: { type: String, required: true },
    dateNaissance: { type: Date },

    // ✅ IMPORTANT: normalisation email (évite les bugs "Utilisateur non trouvé")
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    numeroEtudiant: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "examiner", "admin", "etudiant", "examinateur", ""],
      default: "student",
    },
    tokensAuthorized: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
    magicLink: {
      token: { type: String, default: "" },
      expiresAt: { type: Date, default: () => new Date() },
    },
    profilEtudiant: {
      niveauFormation: { type: String, default: "" },
      typeEtude: { type: String, default: "" },
      groupId: { type: String, default: null },
    },
    profilJury: {
      niveauDiplome: { type: String, default: "" },
      posteOccupe: { type: String, default: "" },
      secteurActivite: { type: String, default: "" },
      anneesExperience: { type: Number, default: 0 },
      nombreETPEmployeur: { type: Number, default: 0 },
      expertises: [
        {
          domaine: { type: String, default: "" },
          niveauAutoEvaluation: { type: Number, default: 0 },
        },
      ],
    },
    consentementRGPD: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Si le modèle existe déjà (hot-reload), on le récupère, sinon on le crée
export const User = models.User || model<IUser>("User", userSchema);