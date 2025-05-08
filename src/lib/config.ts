/**
 * Configuration des valeurs par défaut de l'application
 */
export const config = {
  // Configuration des tokens IA
  tokens: {
    // Limite de tokens par défaut pour les utilisateurs (peut être remplacée par une valeur depuis la BD)
    defaultLimit: 10000,
  },

  // Configuration des modèles d'IA disponibles
  models: {
    openai: {
      name: "OpenAI",
      defaultModel: "gpt-3.5-turbo",
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "mistral-medium",
    },
  },
};
