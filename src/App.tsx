<<<<<<< HEAD
import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { AuthPage } from "./components/auth/AuthPage";
import { MagicLinkPage } from "./components/auth/MagicLinkPage";
import { TestLogin } from "./components/auth/TestLogin";
import { DashboardRouter } from "./components/dashboard/DashboardRouter";
import { useAuth } from "./context/AuthContext";

// Composant protégé qui nécessite une authentification
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Application principale avec les routes
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/magic-link" element={<MagicLinkPage />} />

        {/* Routes de test pour faciliter l'accès aux différentes vues */}
        <Route
          path="/test-login/student"
          element={<TestLogin role="student" />}
        />
        <Route
          path="/test-login/examiner"
          element={<TestLogin role="examiner" />}
        />
        <Route path="/test-login/admin" element={<TestLogin role="admin" />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
=======
import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Settings, Loader2, LogOut, ChevronDown, MessageSquare } from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { useAuth } from './context/AuthContext';
import type { AIModel, Message, ChatHistory } from './types';

function App() {
  const { student, isAuthenticated, logout } = useAuth();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const promptStartTime = useRef<Date | null>(null);

  const aiModels: AIModel[] = [
    {
      id: 'gpt-4',
      name: 'ChatGPT-4',
      description: 'Le modèle le plus avancé d\'OpenAI',
      provider: 'OpenAI'
    },
    {
      id: 'gpt-o1',
      name: 'ChatGPT-O1',
      description: 'Modèle optimisé pour les performances',
      provider: 'OpenAI'
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Assistant IA puissant d\'Anthropic',
      provider: 'Anthropic'
    }
  ];

  useEffect(() => {
    if (prompt && !promptStartTime.current) {
      promptStartTime.current = new Date();
    }
  }, [prompt]);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelDropdownOpen(false);
    if (!chatHistory[modelId]) {
      setChatHistory(prev => ({
        ...prev,
        [modelId]: []
      }));
    }
  };

  const currentMessages = selectedModel ? chatHistory[selectedModel] || [] : [];
  const selectedModelData = aiModels.find(model => model.id === selectedModel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedModel) return;

    setIsLoading(true);
    
    const newMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      model: selectedModel
    };
    
    setChatHistory(prev => ({
      ...prev,
      [selectedModel]: [...(prev[selectedModel] || []), newMessage]
    }));
    
    try {
      // Commenté pour le moment - À décommenter lors de l'intégration backend
      /*
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          messages: currentMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'API');
      }

      const data = await response.json();
      */

      // Simulation de réponse - À remplacer par la vraie réponse de l'API
      const aiResponse: Message = {
        role: 'assistant',
        content: `Réponse simulée pour le modèle ${selectedModel}`,
        timestamp: new Date(),
        model: selectedModel
      };

      setChatHistory(prev => ({
        ...prev,
        [selectedModel]: [...(prev[selectedModel] || []), aiResponse]
      }));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
      setPrompt('');
      promptStartTime.current = null;
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Historique des conversations */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold">AI Studio</h1>
        </div>
        
        <div className="space-y-2">
          {Object.entries(chatHistory).map(([modelId, messages]) => {
            const firstMessage = messages[0];
            if (!firstMessage) return null;
            const model = aiModels.find(m => m.id === modelId);
            
            return (
              <div
                key={modelId}
                className={`p-3 rounded-lg hover:bg-gray-800 cursor-pointer ${
                  selectedModel === modelId ? 'bg-gray-800' : ''
                }`}
                onClick={() => handleModelSelect(modelId)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium truncate">{model?.name}</div>
                  <div className="flex items-center text-xs text-gray-400">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {messages.length}
                  </div>
                </div>
                <div className="text-sm text-gray-400 truncate">
                  {firstMessage.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <span>{selectedModelData?.name || 'Sélectionner un modèle'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg z-10">
                {aiModels.map((model) => (
                  <div
                    key={model.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.description}</div>
                    <div className="text-xs text-indigo-600 mt-1">{model.provider}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {student?.firstName} {student?.lastName}
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
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
              <div className="bg-gray-100 rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Écrivez votre message ici..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!selectedModel}
              />
              <button
                type="submit"
                disabled={!selectedModel || !prompt.trim() || isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Envoyer</span>
              </button>
            </div>
            {!selectedModel && (
              <p className="text-sm text-red-500 mt-2">
                Veuillez sélectionner un modèle d'IA
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238
