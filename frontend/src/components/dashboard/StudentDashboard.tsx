import { Brain, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { ChatHistory, Message } from "../../types";
import { LogoutButton } from "../auth/LogoutButton";

export const StudentDashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tokensRemaining, setTokensRemaining] = useState(50);

  const currentMessages = selectedModel ? chatHistory[selectedModel] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedModel || tokensRemaining <= 0) return;

    setIsLoading(true);

    const newMessage: Message = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
      model: selectedModel,
    };

    setChatHistory((prev) => ({
      ...prev,
      [selectedModel]: [...(prev[selectedModel] || []), newMessage],
    }));

    try {
      // Simulation de réponse - À remplacer par la vraie réponse de l'API
      const aiResponse: Message = {
        role: "assistant",
        content: `Réponse simulée pour le modèle ${selectedModel}`,
        timestamp: new Date(),
        model: selectedModel,
      };

      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: [...(prev[selectedModel] || []), aiResponse],
      }));

      // Simuler la consommation de tokens
      setTokensRemaining((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold">AI studio</h1>
        </div>

        <div className="mt-8">
          <div className="p-3 rounded-lg bg-gray-800 cursor-pointer">
            <span className="font-medium">Test étudiant</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={() => setSelectedModel("gpt-4")}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Choix de l'IA
          </button>

          <div className="px-4 py-2 bg-gray-200 rounded-lg">
            Nombre de tokens restant : {tokensRemaining}
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gray-200 rounded-lg">Étudiant</div>
            <LogoutButton />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-300">
          {currentMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Écrivez votre message ici..."
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!selectedModel || tokensRemaining <= 0}
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-full px-6 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !prompt.trim() ||
                !selectedModel ||
                isLoading ||
                tokensRemaining <= 0
              }
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
