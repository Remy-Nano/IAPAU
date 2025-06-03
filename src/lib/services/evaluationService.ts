import { Conversation } from "@/lib/models/conversation";
import { Evaluation } from "@/lib/models/evaluation";

export interface CreateEvaluationData {
  conversationId: string;
  studentId: string;
  examinerId: string;
  note: number;
  comment: string;
}

export async function createEvaluation(data: CreateEvaluationData) {
  const { conversationId, studentId, examinerId, note, comment } = data;

  // Validation des champs obligatoires
  if (!conversationId || !studentId || !examinerId || !note || !comment) {
    throw new Error(
      "Tous les champs sont requis : conversationId, studentId, examinerId, note, comment"
    );
  }

  // Validation de la note
  if (typeof note !== "number" || note < 1 || note > 10) {
    throw new Error("La note doit être un nombre entre 1 et 10");
  }

  // Validation du commentaire
  if (typeof comment !== "string" || comment.trim().length === 0) {
    throw new Error("Le commentaire ne peut pas être vide");
  }

  // Récupérer la conversation pour obtenir hackathonId et tacheId
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error("Conversation introuvable");
  }

  // Création de l'évaluation avec hackathonId et tacheId automatiques
  const evaluation = await Evaluation.create({
    conversationId,
    studentId,
    examinerId,
    hackathonId: conversation.hackathonId,
    tacheId: conversation.tacheId,
    note,
    comment: comment.trim(),
  });

  return evaluation;
}
