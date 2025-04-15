import mongoose, { Document, Schema } from "mongoose";

// Interface pour le type Message
interface IMessage {
  role: "user" | "ai";
  content: string;
  timestamp?: Date;
  tokenCount?: number;
}

// Interface pour la version finale
interface IVersionFinale {
  promptFinal: string;
  reponseIAFinale: string;
  soumisLe: Date;
}

// Interface pour les statistiques IA
interface IStatistiquesIA {
  modelUtilise: string;
  tokensTotal: number;
  coutEstime?: number;
}

// Interface pour le document Conversation
export interface IConversation extends Document {
  studentId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  tacheId: mongoose.Types.ObjectId;
  modelName: string;
  titreConversation: string;
  promptType: string;
  messages: IMessage[];
  versionFinale?: IVersionFinale;
  statistiquesIA?: IStatistiquesIA;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les messages
const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tokenCount: {
    type: Number,
  },
});

// Schéma pour la version finale
const VersionFinaleSchema = new Schema<IVersionFinale>({
  promptFinal: {
    type: String,
    required: true,
  },
  reponseIAFinale: {
    type: String,
    required: true,
  },
  soumisLe: {
    type: Date,
    default: Date.now,
  },
});

// Schéma pour les statistiques IA
const StatistiquesIASchema = new Schema<IStatistiquesIA>({
  modelUtilise: {
    type: String,
    required: true,
  },
  tokensTotal: {
    type: Number,
    default: 0,
  },
  coutEstime: {
    type: Number,
  },
});

// Schéma pour la conversation
const ConversationSchema = new Schema<IConversation>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    tacheId: {
      type: Schema.Types.ObjectId,
      ref: "Tache",
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    titreConversation: {
      type: String,
      required: true,
    },
    promptType: {
      type: String,
      enum: ["one shot", "contextuel"],
      required: true,
    },
    messages: [MessageSchema],
    versionFinale: VersionFinaleSchema,
    statistiquesIA: StatistiquesIASchema,
  },
  { timestamps: true }
);

export default mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
