import { Message } from "@/types";

/**
 * Convertit les rôles de messages entre le format de l'API et le format de l'interface
 * @param messages Liste des messages à convertir
 * @param defaultModelName Nom du modèle à utiliser par défaut si non spécifié dans le message
 * @returns Messages avec rôles et modèles normalisés
 */
export function adaptMessagesRoles(
  messages: Message[],
  defaultModelName: string
): Message[] {
  return messages.map((message: Message) => {
    // Cloner le message pour éviter des modifications non désirées
    const updatedMessage = { ...message };

    // Convertir les rôles backend en rôles frontend
    if (message.role === "student") updatedMessage.role = "user";
    else if (message.role === "assistant") updatedMessage.role = "ai";

    // Si c'est un message d'IA sans modèle spécifié, ajouter le modèle par défaut
    if (
      (updatedMessage.role === "ai" || message.role === "assistant") &&
      !updatedMessage.modelUsed
    ) {
      updatedMessage.modelUsed = defaultModelName;
    }

    return updatedMessage;
  });
}

/**
 * Convertit le rôle d'un message du format frontend au format attendu par les APIs d'IA
 * @param role Rôle à convertir
 * @returns Rôle au format compatbile avec les APIs
 */
export function convertRoleForAI(
  role: string
): "user" | "assistant" | "system" {
  if (role === "student" || role === "user") return "user";
  if (role === "assistant" || role === "ai") return "assistant";
  return "system";
}
