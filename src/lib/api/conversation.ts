// src/lib/api/conversation.ts
import type { IConversation, IMessage } from "@/lib/models/conversation";

const BASE_URL = "/api/conversations";

/**
 * Crée une nouvelle conversation via l'API et retourne l'objet IConversation.
 */
export async function createConversation(
  token: string,
  data: {
    studentId: string;
    modelName: string;
    hackathonId?: string | null;
    tacheId?: string | null;
    groupId?: string | null;
  }
): Promise<IConversation> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const { conversation } = await response.json();
  return conversation as IConversation;
}

/**
 * Récupère une conversation existante par son ID.
 */
export async function fetchConversation(
  token: string,
  id: string
): Promise<IConversation> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const { conversation } = await response.json();
  return conversation as IConversation;
}

/**
 * Envoie un message dans une conversation et retourne la conversation mise à jour.
 */
export async function sendMessage(
  token: string,
  convoId: string,
  message: IMessage
): Promise<IConversation> {
  const response = await fetch(`${BASE_URL}/${convoId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const { conversation } = await response.json();
  return conversation as IConversation;
}
