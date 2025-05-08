// src/lib/models/conversation.ts
import { Document, Schema, model, models } from "mongoose";

export interface IMessage {
  role: "student" | "assistant" | "system";
  content: string;
  createdAt: Date;
  tokenCount?: number;
  modelUsed?: string;
}

export interface IVersionFinale {
  promptFinal: string;
  reponseIAFinale: string;
  soumisLe: Date;
}

export interface IStatistiquesIA {
  modelUtilise: string;
  tokensTotal: number;
  coutEstime?: number;
}

export interface IConversation extends Document {
  hackathonId?: string;
  tacheId?: string;
  studentId?: string;
  groupId?: string;
  modelName?: string;
  maxTokens?: number;
  maxTokensUsed?: number;
  temperature?: number;
  temperatureUsed?: number;
  messages: IMessage[];
  versionFinale: IVersionFinale;
  statistiquesIA?: IStatistiquesIA;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["student", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
    tokenCount: { type: Number },
    modelUsed: { type: String },
  },
  { _id: false }
);

const VersionSchema = new Schema<IVersionFinale>(
  {
    promptFinal: { type: String, default: "" },
    reponseIAFinale: { type: String, default: "" },
    soumisLe: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const StatistiquesSchema = new Schema<IStatistiquesIA>(
  {
    modelUtilise: { type: String, default: "inconnu" },
    tokensTotal: { type: Number, default: 0 },
    coutEstime: { type: Number },
  },
  { _id: false }
);

const convSchema = new Schema<IConversation>(
  {
    hackathonId: { type: String, default: null },
    tacheId: { type: String, default: null },
    studentId: { type: String, default: null },
    groupId: { type: String, default: null },
    modelName: { type: String, default: null },
    maxTokens: { type: Number, default: 512 },
    maxTokensUsed: { type: Number, required: false },
    temperature: { type: Number, default: 0.7 },
    temperatureUsed: { type: Number, required: false },
    messages: { type: [MessageSchema], default: [] },
    versionFinale: { type: VersionSchema, default: () => ({}) },
    statistiquesIA: { type: StatistiquesSchema },
  },
  { timestamps: true }
);

export const Conversation =
  models.Conversation || model<IConversation>("Conversation", convSchema);
