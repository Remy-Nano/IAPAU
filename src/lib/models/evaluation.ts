import { Document, Schema, model, models } from "mongoose";

export interface IEvaluation extends Document {
  conversationId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;
  examinerId: Schema.Types.ObjectId;
  hackathonId?: Schema.Types.ObjectId;
  note: number;
  comment: string;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const evaluationSchema = new Schema<IEvaluation>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examinerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hackathonId: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
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

// Middleware pour déduire hackathonId depuis la conversation
evaluationSchema.pre("save", async function (next) {
  if (!this.hackathonId && this.conversationId) {
    try {
      const { Conversation } = await import("./conversation");
      const conversation = await Conversation.findById(this.conversationId);
      if (conversation?.hackathonId) {
        this.hackathonId = conversation.hackathonId as Schema.Types.ObjectId;
      }
    } catch (error) {
      console.warn("Impossible de récupérer hackathonId:", error);
    }
  }
  next();
});

export const Evaluation =
  models.Evaluation || model<IEvaluation>("Evaluation", evaluationSchema);
