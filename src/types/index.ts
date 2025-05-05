export type UserRole = "student" | "examiner" | "admin";

// Type de base pour toutes les catégories d'utilisateurs
export type User = {
  id?: string;
  _id: string;
  nom?: string;
  prenom?: string;
  email: string;
  dateNaissance?: Date;
  formation?: string;
  role: UserRole;
  groupes?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  firstName?: string;
  lastName?: string;
};

// Spécialisations selon les rôles
export type Student = User & {
  studentId: string;
};

export type Examiner = User & {
  // Spécificités possibles à ajouter plus tard
};

export type Admin = User & {
  // Spécificités possibles à ajouter plus tard
};

// Modèle d'IA disponible
export type AIModel = {
  id: string;
  name: string;
  description: string;
  provider: string;
};

// Message dans une conversation
export type Message = {
  _id?: string;
  role: "user" | "ai";
  content: string;
  timestamp?: Date;
  tokenCount?: number;
  modelUsed?: string;
};

// Historique par IA utilisée
export type ChatHistory = {
  [modelId: string]: Message[];
};

// Groupe d'utilisateurs
export type Group = {
  _id: string;
  nom: string;
  description: string;
  membres: string[]; // IDs utilisateurs
  createdAt: Date;
  updatedAt: Date;
};

// Tâche attribuée à un groupe
export type Tache = {
  _id: string;
  titre: string;
  description: string;
  deadline: Date;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Statistiques d'utilisation d'un modèle
export type StatistiquesIA = {
  modelUtilise: string;
  tokensTotal: number;
  coutEstime?: number;
};

// Conversation IA liée à un étudiant + tâche
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
