import { Conversation } from "@/lib/models/conversation";

export interface ConversationFilters {
  withFinalVersion?: boolean;
  hackathonId?: string;
  tacheId?: string;
}

export async function getConversationsWithFilters(
  filters: ConversationFilters
) {
  const { withFinalVersion, hackathonId, tacheId } = filters;

  const query: {
    $and?: Array<Record<string, unknown>>;
    hackathonId?: string;
    tacheId?: string;
  } = {};

  // Filtrer les conversations avec versionFinale non vide
  if (withFinalVersion) {
    query.$and = [
      { "versionFinale.promptFinal": { $exists: true, $ne: "" } },
      { "versionFinale.reponseIAFinale": { $exists: true, $ne: "" } },
    ];
  }

  // Filtrer par hackathon si spécifié
  if (hackathonId && hackathonId !== "all") {
    query.hackathonId = hackathonId;
  }

  // Filtrer par tâche si spécifié
  if (tacheId && tacheId !== "all") {
    query.tacheId = tacheId;
  }

  const conversations = await Conversation.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return conversations;
}
