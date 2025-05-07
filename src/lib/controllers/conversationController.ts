// src/lib/controllers/conversationController.ts
import {
  Conversation,
  IConversation,
  IMessage,
} from "@/lib/models/conversation";

export async function createConversation(data: {
  hackathonId?: string;
  tacheId?: string;
  studentId?: string;
  groupId?: string;
  modelName?: string;
}): Promise<IConversation> {
  return Conversation.create({
    ...data,
    messages: [],
    versionFinale: {},
  });
}

export async function getConversation(
  id: string
): Promise<IConversation | null> {
  return Conversation.findById(id).lean<IConversation>();
}

export async function addMessage(
  convoId: string,
  message: {
    role: "student" | "assistant" | "system";
    content: string;
    tokenCount?: number;
    modelUsed?: string;
  }
): Promise<IConversation | null> {
  const msg: IMessage = { ...message, createdAt: new Date() };

  // Mettre à jour la conversation avec le nouveau message
  const updatedConversation = await Conversation.findByIdAndUpdate(
    convoId,
    { $push: { messages: msg } },
    { new: true }
  ).lean<IConversation>();

  // Si le message contient un comptage de tokens, mettre à jour les statistiques
  if (message.tokenCount && message.role === "assistant") {
    // Récupérer les statistiques actuelles ou initialiser
    const currentStats = updatedConversation?.statistiquesIA || {
      modelUtilise: message.modelUsed || "inconnu",
      tokensTotal: 0,
    };

    // Ajouter les nouveaux tokens au total
    currentStats.tokensTotal += message.tokenCount;

    // Mettre à jour le modèle utilisé si fourni
    if (message.modelUsed) {
      currentStats.modelUtilise = message.modelUsed;
    }

    // Mettre à jour les statistiques dans la conversation
    await Conversation.findByIdAndUpdate(
      convoId,
      { statistiquesIA: currentStats },
      { new: true }
    );

    // Récupérer la conversation à jour avec les statistiques
    return Conversation.findById(convoId).lean<IConversation>();
  }

  return updatedConversation;
}

export async function getConversationsByStudent(
  studentId: string
): Promise<IConversation[]> {
  console.log("Recherche des conversations pour studentId:", studentId);

  // Pour debugger, cherchons toutes les conversations
  const allConversations = await Conversation.find().lean<IConversation[]>();
  console.log(
    "Toutes les conversations:",
    JSON.stringify(allConversations, null, 2)
  );

  // Essayer de trouver des conversations avec le studentId spécifique
  let conversations = await Conversation.find({ studentId })
    .sort({ createdAt: -1 })
    .lean<IConversation[]>();

  // Si aucune conversation n'est trouvée, essayer avec une recherche moins stricte
  if (!conversations || conversations.length === 0) {
    // Le studentId pourrait être stocké dans un format différent, essayons de comparer
    // la chaîne de caractères au lieu de l'objet
    conversations = allConversations.filter(
      (conv) => conv.studentId && conv.studentId.toString() === studentId
    );

    // Si toujours aucune conversation, retourner les 5 dernières conversations
    if (!conversations || conversations.length === 0) {
      console.log(
        "Aucune conversation trouvée, retour des 5 dernières conversations"
      );
      conversations = allConversations
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
    }
  }

  console.log(
    "Conversations trouvées:",
    JSON.stringify(conversations, null, 2)
  );

  return conversations;
}

export async function deleteConversation(id: string): Promise<boolean> {
  const result = await Conversation.findByIdAndDelete(id);
  return !!result; // Renvoie true si la suppression a réussi, false sinon
}
