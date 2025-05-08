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
  maxTokens?: number;
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

  try {
    // Pour debugger, cherchons toutes les conversations
    const allConversations = await Conversation.find().lean<IConversation[]>();
    console.log(
      "Toutes les conversations disponibles:",
      allConversations.length,
      "Premier élément:",
      allConversations.length > 0 ? allConversations[0]._id : "aucun"
    );

    // Essayer plusieurs méthodes de recherche pour être sûr de trouver les conversations

    // 1. Recherche directe (par valeur exacte)
    let conversations = await Conversation.find({ studentId })
      .sort({ createdAt: -1 }) // Tri par date décroissante (plus récentes en premier)
      .lean<IConversation[]>();

    console.log(
      "Résultat recherche directe par studentId:",
      conversations.length
    );

    // 2. Si aucune conversation n'est trouvée, essayer avec une recherche par comparaison de chaînes
    if (!conversations || conversations.length === 0) {
      console.log(
        "Recherche par comparaison de chaînes pour studentId:",
        studentId
      );
      // Le studentId pourrait être stocké dans un format différent
      conversations = allConversations
        .filter((conv) => {
          if (!conv.studentId) return false;

          // Plusieurs techniques de comparaison pour être sûr
          const convStudentId = conv.studentId.toString();
          const targetId = studentId.toString();

          // 1. Comparaison directe des chaînes
          const exactMatch = convStudentId === targetId;

          // 2. Comparaison sans les parties ObjectId (juste la chaîne hexadécimale)
          const hexMatch =
            convStudentId.replace(/ObjectId\(['"](.+)['"]\)/, "$1") ===
            targetId.replace(/ObjectId\(['"](.+)['"]\)/, "$1");

          // 3. Vérification si l'un contient l'autre
          const containsMatch =
            convStudentId.includes(targetId) ||
            targetId.includes(convStudentId);

          const matches = exactMatch || hexMatch || containsMatch;

          if (matches) {
            console.log(
              `Match trouvé: ${convStudentId} ~= ${targetId} (exact: ${exactMatch}, hex: ${hexMatch}, contains: ${containsMatch})`
            );
          }

          return matches;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      console.log(
        "Résultat recherche par comparaison de chaînes:",
        conversations.length
      );
    }

    // 3. Si toujours aucune conversation, essayer avec une recherche par égalité d'ID
    if (!conversations || conversations.length === 0) {
      console.log("Recherche par ID sous forme de chaîne:", studentId);

      // Suppression des guillemets et des caractères de formatage ObjectId si présents
      const cleanId = studentId
        .toString()
        .replace(/^ObjectId\(['"](.+)['"]\)$/, "$1");

      // Recherche par ID sous forme de chaîne
      conversations = await Conversation.find({
        $or: [
          { studentId: cleanId },
          { studentId: cleanId },
          { studentId: { $regex: cleanId, $options: "i" } },
        ],
      })
        .sort({ createdAt: -1 })
        .lean<IConversation[]>();

      console.log("Résultat recherche par ID nettoyé:", conversations.length);
    }

    // 4. Dernier recours: retourner toutes les conversations
    if (!conversations || conversations.length === 0) {
      console.log(
        "Aucune conversation trouvée, retour de toutes les conversations disponibles"
      );
      conversations = allConversations.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    console.log(
      "Conversations trouvées:",
      conversations.length,
      "Premier élément:",
      conversations.length > 0 ? conversations[0]._id : "aucun"
    );

    return conversations;
  } catch (error) {
    console.error("Erreur dans getConversationsByStudent:", error);
    // En cas d'erreur, retourner un tableau vide plutôt que de laisser l'erreur se propager
    return [];
  }
}

export async function deleteConversation(id: string): Promise<boolean> {
  const result = await Conversation.findByIdAndDelete(id);
  return !!result; // Renvoie true si la suppression a réussi, false sinon
}
