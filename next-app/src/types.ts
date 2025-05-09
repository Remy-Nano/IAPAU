export type UserRole = "student" | "examiner" | "admin";

export type User = {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: Date;
  formation: string;
  role: "student" | "admin" | "teacher";
  groupes: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Student = User & {
  firstName: string;
  lastName: string;
  studentId: string;
};

export type Examiner = User & {
  firstName: string;
  lastName: string;
};

export type Admin = User & {
  firstName: string;
  lastName: string;
};

export type AIModel = {
  id: string;
  name: string;
  description: string;
  provider: string;
};

export type Message = {
  _id?: string;
  role: "user" | "ai";
  content: string;
  timestamp?: Date;
  tokenCount?: number;
};

export type ChatHistory = {
  [modelId: string]: Message[];
};

export type Group = {
  _id: string;
  nom: string;
  description: string;
  membres: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Tache = {
  _id: string;
  titre: string;
  description: string;
  deadline: Date;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StatistiquesIA = {
  modelUtilise: string;
  tokensTotal: number;
  coutEstime?: number;
};

export type Conversation = {
  _id: string;
  studentId: string;
  groupId: string;
  tacheId: string;
  modelName: string;
  titreConversation: string;
  promptType: "one shot" | "contextuel";
  messages: Message[];
  statistiquesIA?: StatistiquesIA;
  versionFinale?: {
    promptFinal: string;
    reponseIAFinale: string;
    soumisLe: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};
