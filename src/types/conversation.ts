// Types partagés pour les conversations utilisés dans chat et examiner
export interface BaseConversation {
  _id: string;
  studentId: string;
  createdAt: string | Date;
  hackathonId?: string;
  modelName?: string;
  titreConversation?: string;
}

export interface ConversationMessage {
  content: string;
  role: "user" | "ai" | "assistant";
  modelUsed?: string;
}

export interface ConversationVersionFinale {
  promptFinal: string;
  reponseIAFinale: string;
  soumisLe: string | Date;
}

export interface ConversationStats {
  modelUtilise: string;
}

// Type pour les conversations dans la sidebar
export interface ConversationItem extends BaseConversation {
  modelName: string;
  titreConversation: string;
  createdAt: string;
  messages?: ConversationMessage[];
  versionFinale?: ConversationVersionFinale;
  statistiquesIA?: ConversationStats;
}

// Type pour les conversations dans ExaminerDashboard
export interface ExaminerConversation extends BaseConversation {
  versionFinale: ConversationVersionFinale;
  createdAt: Date;
}

// Type pour les évaluations
export interface Evaluation {
  _id: string;
  conversationId: string;
  note: number;
  comment: string;
  gradedAt: Date;
  populatedConversation?: {
    versionFinale: ConversationVersionFinale;
    createdAt: Date;
  };
}

export interface EvaluationForm {
  note: number;
  comment: string;
}
