import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Conversation from "../models/Conversation";
import { askAI, estimateTokenCount } from "./ai.controller";

// Validation des données avec Zod - plus souple pour le développement
const CreateConversationSchema = z.object({
  studentId: z.string(),
  groupId: z.string(),
  tacheId: z.string(),
  modelName: z.string().min(1),
  titreConversation: z.string().min(1),
  promptType: z.enum(["one shot", "contextuel"]),
  prompt: z.string().min(1),
});

const AiResponseSchema = z.object({
  prompt: z.string().min(1),
  modelName: z.string().min(1),
});

const FinalVersionSchema = z.object({
  promptFinal: z.string().min(1),
  reponseIAFinale: z.string().min(1),
});

/**
 * Crée une nouvelle conversation avec un prompt initial
 */
export const createConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Données reçues:", req.body);

    // Validation des données
    const validationResult = CreateConversationSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.error("Erreur de validation:", validationResult.error.format());
      res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validationResult.error.format(),
      });
      return;
    }

    const {
      studentId,
      groupId,
      tacheId,
      modelName,
      titreConversation,
      promptType,
      prompt,
    } = validationResult.data;

    console.log("Données validées:", validationResult.data);

    // Conversion des chaînes en ObjectId
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const groupObjectId = new mongoose.Types.ObjectId(groupId);
    const tacheObjectId = new mongoose.Types.ObjectId(tacheId);

    // Estimation du nombre de tokens dans le prompt
    const promptTokenCount = estimateTokenCount(prompt);

    // Création de la conversation avec le message initial de l'utilisateur
    const conversation = new Conversation({
      studentId: studentObjectId,
      groupId: groupObjectId,
      tacheId: tacheObjectId,
      modelName,
      titreConversation,
      promptType,
      messages: [
        {
          role: "user",
          content: prompt,
          timestamp: new Date(),
          tokenCount: promptTokenCount,
        },
      ],
      statistiquesIA: {
        modelUtilise: modelName,
        tokensTotal: promptTokenCount,
      },
    });

    // Obtention de la réponse de l'IA
    try {
      const aiResponse = await askAI(modelName, prompt);
      console.log(
        `Réponse du modèle ${modelName}:`,
        aiResponse.content.substring(0, 100) + "..."
      );

      // Ajout de la réponse de l'IA aux messages avec les informations de tokens
      conversation.messages.push({
        role: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
        tokenCount: aiResponse.tokenCount,
      });

      // Mise à jour des statistiques
      if (conversation.statistiquesIA) {
        conversation.statistiquesIA.tokensTotal += aiResponse.tokenCount;
        conversation.statistiquesIA.modelUtilise = aiResponse.modelUsed;
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'IA:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la communication avec l'IA",
      });
      return;
    }

    // Sauvegarde de la conversation
    await conversation.save();
    console.log("Conversation enregistrée avec succès, ID:", conversation._id);

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

/**
 * Ajoute une nouvelle réponse d'IA à une conversation existante
 */
export const addAiResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "ID de conversation invalide",
      });
      return;
    }

    // Validation des données
    const validationResult = AiResponseSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validationResult.error.format(),
      });
      return;
    }

    const { prompt, modelName } = validationResult.data;

    // Recherche de la conversation
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation non trouvée",
      });
      return;
    }

    // Estimation du nombre de tokens dans le prompt
    const promptTokenCount = estimateTokenCount(prompt);

    // Ajout du prompt de l'utilisateur avec timestamp et tokens
    conversation.messages.push({
      role: "user",
      content: prompt,
      timestamp: new Date(),
      tokenCount: promptTokenCount,
    });

    // Mise à jour des statistiques
    if (conversation.statistiquesIA) {
      conversation.statistiquesIA.tokensTotal += promptTokenCount;
    } else {
      conversation.statistiquesIA = {
        modelUtilise: modelName,
        tokensTotal: promptTokenCount,
      };
    }

    // Obtention de la réponse de l'IA
    try {
      const aiResponse = await askAI(modelName, prompt);

      // Ajout de la réponse de l'IA aux messages avec timestamp et tokens
      conversation.messages.push({
        role: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
        tokenCount: aiResponse.tokenCount,
      });

      // Mise à jour des statistiques
      if (conversation.statistiquesIA) {
        conversation.statistiquesIA.tokensTotal += aiResponse.tokenCount;
        conversation.statistiquesIA.modelUtilise = aiResponse.modelUsed;
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'IA:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la communication avec l'IA",
      });
      return;
    }

    // Mise à jour du nom du modèle si différent
    if (conversation.modelName !== modelName) {
      conversation.modelName = modelName;
    }

    // Sauvegarde des modifications
    await conversation.save();

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la réponse:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

/**
 * Met à jour la version finale d'une conversation
 */
export const updateFinalVersion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "ID de conversation invalide",
      });
      return;
    }

    // Validation des données
    const validationResult = FinalVersionSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validationResult.error.format(),
      });
      return;
    }

    const { promptFinal, reponseIAFinale } = validationResult.data;

    // Recherche et mise à jour de la conversation
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      {
        versionFinale: {
          promptFinal,
          reponseIAFinale,
          soumisLe: new Date(),
        },
      },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation non trouvée",
      });
      return;
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la version finale:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

/**
 * Récupère toutes les conversations d'un étudiant
 */
export const getConversationsByStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({
        success: false,
        message: "ID d'étudiant invalide",
      });
      return;
    }

    // Recherche des conversations de l'étudiant avec tri par date de création décroissante
    const conversations = await Conversation.find(
      { studentId: new mongoose.Types.ObjectId(studentId) },
      {
        _id: 1,
        modelName: 1,
        titreConversation: 1,
        createdAt: 1,
        messages: { $slice: 1 }, // Récupère seulement le premier message pour l'aperçu
        versionFinale: 1, // Inclure la version finale pour identifier les conversations soumises
      }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

/**
 * Récupère une conversation par son ID
 */
export const getConversationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "ID de conversation invalide",
      });
      return;
    }

    // Recherche de la conversation
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation non trouvée",
      });
      return;
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

/**
 * Supprime une conversation par son ID
 */
export const deleteConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "ID de conversation invalide",
      });
      return;
    }

    // Recherche et suppression de la conversation
    const deletedConversation = await Conversation.findByIdAndDelete(id);

    if (!deletedConversation) {
      res.status(404).json({
        success: false,
        message: "Conversation non trouvée",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Conversation supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la conversation:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};
