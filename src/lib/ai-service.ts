<<<<<<< HEAD
import { Mistral } from "@mistralai/mistralai";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { config } from "./config";
import { convertRoleForAI } from "./utils/messageUtils";

// Initialisation des clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

/**
 * Génère une réponse IA en fonction du modèle spécifié
 */
export async function generateAIResponse(
  prompt: string,
  modelName: string,
  history: { role: string; content: string }[] = [],
  maxTokens: number = 512
): Promise<{ content: string; tokenCount?: number }> {
  try {
    if (process.env.E2E_TESTING === "true") {
      return {
        content: "Bonjour (mock E2E).",
        tokenCount: 0,
      };
    }

    // Générer une réponse avec OpenAI
    if (modelName.toLowerCase().includes("openai") || modelName === "gpt") {
      // Convertir les messages pour le format OpenAI
      const messages: ChatCompletionMessageParam[] = history.map((msg) => ({
        role: convertRoleForAI(msg.role),
        content: msg.content,
      }));

      // Ajouter le prompt actuel
      messages.push({ role: "user", content: prompt });

      const response = await openai.chat.completions.create({
        model: config.models.openai.defaultModel,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
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
            role: convertRoleForAI(msg.role),
            content: msg.content,
          });
        }

        // Ajouter le prompt actuel
        formattedMessages.push({ role: "user", content: prompt });

        // Appel à l'API Mistral
        const response = await mistral.chat.complete({
          model: config.models.mistral.defaultModel,
          messages: formattedMessages as any, // Forcer le type pour contourner les limitations
          // Passer directement l'objet avec les paramètres à l'API
          ...{ maxTokens }, // Utiliser la syntaxe d'extension pour ajouter maxTokens
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
=======
// src/lib/ai-service.ts
import { Mistral } from "@mistralai/mistralai";
import { convertRoleForAI } from "./utils/messageUtils";

const mistralApiKey = process.env.MISTRAL_API_KEY || "";

if (!mistralApiKey) {
  console.warn("⚠️ MISTRAL_API_KEY non définie dans l'environnement (.env.local)");
}

const mistral = new Mistral({
  apiKey: mistralApiKey,
});

// ✅ Liste de modèles Mistral qu'on va tester dans l'ordre
const MISTRAL_MODELS = [
  "mistral-small-latest",
  "mistral-tiny-latest",
  "open-mistral-7b",
];

type HistoryMessage = { role: string; content: string };

export async function generateAIResponse(
  prompt: string,
  _modelName: string, // on ignore pour l'instant, on utilise MISTRAL_MODELS
  history: HistoryMessage[] = [],
  maxTokens: number = 512
): Promise<{ content: string; tokenCount?: number; modelUsed?: string }> {
  // On construit les messages communs
  const formattedMessages = [
    ...history.map((msg) => ({
      role: convertRoleForAI(msg.role),
      content: msg.content,
    })),
    { role: "user", content: prompt },
  ];

  let lastError: unknown = null;

  for (const model of MISTRAL_MODELS) {
    try {
      console.log(`🔮 Tentative avec le modèle Mistral: ${model}`);

      const response = await mistral.chat.complete({
        model,
        messages: formattedMessages as any,
        max_tokens: maxTokens,
        temperature: 0.7,
      } as any);

      if (!response.choices || response.choices.length === 0) {
        throw new Error(`Pas de réponse générée par le modèle ${model}`);
      }

      const content =
        (response.choices[0] as any).message?.content ||
        "Pas de réponse générée";

      console.log(`✅ Réponse obtenue avec ${model}`);

      return {
        content: String(content),
        tokenCount: (response.usage as any)?.totalTokens,
        modelUsed: model,
      };
    } catch (error: any) {
      console.error(`❌ Erreur avec le modèle ${model}:`, error);

      // On garde l'erreur pour éventuellement la remonter
      lastError = error;

      // Si c'est une erreur de capacité / 429 → on essaie le modèle suivant
      const isCapacityError =
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        error.statusCode === 429;

      if (isCapacityError) {
        console.warn(
          `⚠️ Modèle ${model} saturé (429 / capacity exceeded). On tente le modèle suivant…`
        );
        continue; // on passe au modèle suivant
      }

      // Si c'est une autre erreur, on ne force pas le fallback, on remonte directement
      throw new Error(
        `Erreur avec le modèle Mistral (${model}): ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Si on arrive ici, tous les modèles Mistral ont échoué
  throw new Error(
    `Tous les modèles Mistral ont échoué. Dernière erreur: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
>>>>>>> 51b2420 (feat: examiner evaluation flow + student results page)
}
