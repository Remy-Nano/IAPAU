import { Document, Schema, model, models } from "mongoose";

export interface IEvaluation extends Document {
  conversationId: string;
  studentId: string;
  examinerId: string;
  hackathonId?: string;
  tacheId?: string;
  note: number;
  comment: string;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const evaluationSchema = new Schema<IEvaluation>(
  {
    conversationId: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    examinerId: {
      type: String,
      required: true,
    },
    hackathonId: {
      type: String,
    },
    tacheId: {
      type: String,
    },
    note: {
      type: Number,
      required: true,
      min: [1, "La note doit être au minimum de 1"],
      max: [10, "La note doit être au maximum de 10"],
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    gradedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

// Index unique sur la combinaison examinerId + conversationId
evaluationSchema.index({ examinerId: 1, conversationId: 1 }, { unique: true });

// Forcer la suppression du modèle existant s'il existe
if (models.Evaluation) {
  delete models.Evaluation;
}

export const Evaluation = model<IEvaluation>("Evaluation", evaluationSchema);
