// src/lib/models/conversation.ts
import { Document, Schema, model, models } from "mongoose";

export interface IMessage {
  role: "student" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface IVersionFinale {
  promptFinal: string;
  reponseIAFinale: string;
  soumisLe: Date;
}

export interface IConversation extends Document {
  hackathonId?: string;
  tacheId?: string;
  studentId?: string;
  groupId?: string;
  modelName?: string;
  messages: IMessage[];
  versionFinale: IVersionFinale;
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

const convSchema = new Schema<IConversation>(
  {
    hackathonId: { type: String, default: null },
    tacheId: { type: String, default: null },
    studentId: { type: String, default: null },
    groupId: { type: String, default: null },
    modelName: { type: String, default: null },
    messages: { type: [MessageSchema], default: [] },
    versionFinale: { type: VersionSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Conversation =
  models.Conversation || model<IConversation>("Conversation", convSchema);
