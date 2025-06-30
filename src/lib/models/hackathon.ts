import { Document, Schema, model, models } from "mongoose";

export interface IHackathon extends Document {
  nom: string;
  description: string;
  objectifs: string;
  dates: {
    debut: Date;
    fin: Date;
    archiveLe?: Date;
  };
  anonymatActif: boolean;
  quotas: {
    promptsParEtudiant: number;
    tokensParEtudiant: number;
  };
  taches: string[];
  statut: string;
  createdAt: Date;
  updatedAt: Date;
}

const hackathonSchema = new Schema<IHackathon>(
  {
    nom: { type: String, required: true },
    description: String,
    objectifs: String,
    dates: {
      debut: Date,
      fin: Date,
      archiveLe: Date,
    },
    anonymatActif: { type: Boolean, default: false },
    quotas: {
      promptsParEtudiant: { type: Number, default: 0 },
      tokensParEtudiant: { type: Number, default: 0 },
    },
    taches: [String],
    statut: String,
  },
  { timestamps: true }
);

export const Hackathon =
  models.Hackathon || model<IHackathon>("Hackathon", hackathonSchema);
