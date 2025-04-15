import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Récupération des clés API depuis les variables d'environnement
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

console.log("Clés API disponibles:", {
  openai: OPENAI_API_KEY ? "définie" : "non définie",
  mistral: MISTRAL_API_KEY ? "définie" : "non définie",
});

// Fonction pour estimer le nombre de tokens dans un texte
// Simple estimation : environ 1 token pour 4 caractères en moyenne
export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Envoie un prompt à l'API OpenAI et retourne la réponse
 * @param prompt Le prompt à envoyer
 * @returns La réponse du modèle et les informations de tokens
 */
export const askOpenAI = async (
  prompt: string
): Promise<{ content: string; tokenCount: number }> => {
  try {
    console.log("Envoi d'une requête à OpenAI");

    if (!OPENAI_API_KEY) {
      throw new Error("Clé API OpenAI non définie");
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // Possibilité d'utiliser 'gpt-4' si nécessaire
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const responseContent = response.data.choices[0].message.content;

    // Récupérer les tokens utilisés si disponibles dans la réponse, sinon estimer
    const tokenCount =
      response.data.usage?.total_tokens ||
      estimateTokenCount(prompt) + estimateTokenCount(responseContent);

    return {
      content: responseContent,
      tokenCount,
    };
  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI:", error);
    throw new Error("Échec de la communication avec OpenAI");
  }
};

/**
 * Envoie un prompt à l'API Mistral et retourne la réponse
 * @param prompt Le prompt à envoyer
 * @returns La réponse du modèle et les informations de tokens
 */
export const askMistral = async (
  prompt: string
): Promise<{ content: string; tokenCount: number }> => {
  try {
    console.log("Envoi d'une requête à Mistral");

    if (!MISTRAL_API_KEY) {
      throw new Error("Clé API Mistral non définie");
    }

    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-small", // Modèle de base, peut être ajusté
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
      }
    );

    const responseContent = response.data.choices[0].message.content;

    // Récupérer les tokens utilisés si disponibles dans la réponse, sinon estimer
    const tokenCount =
      response.data.usage?.total_tokens ||
      estimateTokenCount(prompt) + estimateTokenCount(responseContent);

    return {
      content: responseContent,
      tokenCount,
    };
  } catch (error) {
    console.error("Erreur lors de l'appel à Mistral:", error);
    throw new Error("Échec de la communication avec Mistral");
  }
};

/**
 * Fonction générique pour envoyer une requête à un modèle d'IA
 * @param modelName Nom du modèle ('OpenAI' ou 'Mistral')
 * @param prompt Le prompt à envoyer
 * @returns La réponse du modèle et les informations de tokens
 */
export const askAI = async (
  modelName: string,
  prompt: string
): Promise<{ content: string; tokenCount: number; modelUsed: string }> => {
  console.log(`Demande au modèle ${modelName}`);

  let result;
  let modelUsed = modelName.toLowerCase();

  switch (modelUsed) {
    case "openai":
      result = await askOpenAI(prompt);
      break;
    case "mistral":
      result = await askMistral(prompt);
      break;
    default:
      throw new Error(`Modèle non supporté: ${modelName}`);
  }

  return {
    ...result,
    modelUsed,
  };
};
