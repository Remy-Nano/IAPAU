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
  message: { role: "student" | "assistant" | "system"; content: string }
): Promise<IConversation | null> {
  const msg: IMessage = { ...message, createdAt: new Date() };
  return Conversation.findByIdAndUpdate(
    convoId,
    { $push: { messages: msg } },
    { new: true }
  ).lean<IConversation>();
}

export async function getConversationsByStudent(
  studentId: string
): Promise<IConversation[]> {
  return Conversation.find({ studentId })
    .sort({ createdAt: -1 })
    .lean<IConversation[]>();
}
