import { Mistral } from "@mistralai/mistralai";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

// Initialisation des clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

/**
 * Convertit le rôle depuis notre application vers le format attendu par les APIs
 */
function convertRole(role: string): "user" | "assistant" | "system" {
  if (role === "student" || role === "user") {
    return "user";
  } else if (role === "assistant" || role === "ai") {
    return "assistant";
  }
  return "system";
}

/**
 * Génère une réponse IA en fonction du modèle spécifié
 */
export async function generateAIResponse(
  prompt: string,
  modelName: string,
  history: { role: string; content: string }[] = []
): Promise<{ content: string; tokenCount?: number }> {
  try {
    // Générer une réponse avec OpenAI
    if (modelName.toLowerCase().includes("openai") || modelName === "gpt") {
      // Convertir les messages pour le format OpenAI
      const messages: ChatCompletionMessageParam[] = history.map((msg) => ({
        role: convertRole(msg.role),
        content: msg.content,
      }));

      // Ajouter le prompt actuel
      messages.push({ role: "user", content: prompt });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
      });

      return {
        content:
          response.choices[0].message.content || "Pas de réponse générée",
        tokenCount: response.usage?.total_tokens,
      };
    }

    // Générer une réponse avec Mistral
    else if (modelName.toLowerCase().includes("mistral")) {
      try {
        // Convertir les messages au format Mistral
        // Note: Mistral est plus strict sur les types, on passe donc par une approche différente
        const formattedMessages = [];

        // Ajouter les messages d'historique
        for (const msg of history) {
          formattedMessages.push({
            role: convertRole(msg.role),
            content: msg.content,
          });
        }

        // Ajouter le prompt actuel
        formattedMessages.push({ role: "user", content: prompt });

        // Appel à l'API Mistral
        const response = await mistral.chat.complete({
          model: "mistral-medium",
          messages: formattedMessages as any, // Forcer le type pour contourner les limitations
        });

        // Vérifier si la réponse est valide
        if (!response.choices || response.choices.length === 0) {
          throw new Error("Pas de réponse générée par Mistral");
        }

        return {
          content: String(
            response.choices[0].message.content || "Pas de réponse générée"
          ),
          tokenCount: response.usage?.totalTokens,
        };
      } catch (error) {
        console.error("Erreur spécifique Mistral:", error);
        throw error;
      }
    }

    // Modèle non reconnu ou non supporté
    else {
      throw new Error(`Modèle non supporté: ${modelName}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la génération de réponse IA:`, error);
    throw new Error(
      `Erreur avec l'API ${modelName}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
