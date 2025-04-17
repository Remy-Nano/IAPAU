import express from "express";
import {
  addAiResponse,
  createConversation,
  deleteConversation,
  getConversationById,
  getConversationsByStudent,
  getFinalVersion,
  updateFinalVersion,
} from "../controllers/conversation.controller";

const router = express.Router();

/**
 * @route POST /api/conversations
 * @desc Créer une nouvelle conversation avec un prompt initial
 * @access Private
 */
router.post("/", createConversation);

/**
 * @route GET /api/conversations/student/:studentId
 * @desc Récupérer toutes les conversations d'un étudiant
 * @param {string} studentId - ID de l'étudiant
 * @param {boolean} [includeMessages] - Si true, inclut tous les messages de chaque conversation
 * @param {boolean} [includeStats] - Si true, inclut les statistiques d'IA de chaque conversation
 * @access Private
 */
router.get("/student/:studentId", getConversationsByStudent);

/**
 * @route GET /api/conversations/:id
 * @desc Récupérer une conversation par son ID
 * @access Private
 */
router.get("/:id", getConversationById);

/**
 * @route POST /api/conversations/:id/ai-response
 * @desc Ajouter une réponse d'IA à une conversation existante
 * @access Private
 */
router.post("/:id/ai-response", addAiResponse);

/**
 * @route PATCH /api/conversations/:id/final
 * @desc Mettre à jour la version finale d'une conversation
 * @access Private
 */
router.patch("/:id/final", updateFinalVersion);

/**
 * @route GET /api/conversations/:id/version-finale
 * @desc Récupérer la version finale d'une conversation
 * @access Private
 */
router.get("/:id/version-finale", getFinalVersion);

/**
 * @route DELETE /api/conversations/:id
 * @desc Supprimer une conversation par son ID
 * @access Private
 */
router.delete("/:id", deleteConversation);

export default router;
