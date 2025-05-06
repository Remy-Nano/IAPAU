// src/lib/models/user.ts
import { Document, Schema, model, models } from "mongoose";

export interface IUser extends Document {
  prenom?: string;
  nom?: string;
  email: string;
  passwordHash: string;
  role: "student" | "examiner" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    prenom: { type: String },
    nom: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "examiner", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

// Si le modèle existe déjà (hot-reload), on le récupère, sinon on le crée
export const User = models.User || model<IUser>("User", userSchema);
