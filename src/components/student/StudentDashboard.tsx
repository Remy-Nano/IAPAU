"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { FixedPromptInput } from "@/components/chat/FixedPromptInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import Link from "next/link";            // <== 🔥 AJOUT IMPORTANT
import { useAuth } from "@/context/AuthContext";
import { Conversation } from "@/types";
import { Hackathon } from "@/types/Hackathon";
import axios from "axios";
import { Check, ChevronDown, Maximize2, Menu, Minimize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuth();

  const studentId = user?._id || null;
  const defaultTacheId = "6553f1ed4c3ef31ea8c03bc3";
  const defaultGroupId = "6553f1ed4c3ef31ea8c03bc2";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshConversations, setRefreshConversations] = useState(0);

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>("");
  const [loadingHackathons, setLoadingHackathons] = useState(false);

  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isChatReady, setIsChatReady] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const forceRefreshConversations = () => {
    setRefreshConversations((prev) => prev + 1);
  };

  // Charger hackathons
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoadingHackathons(true);
        const response = await axios.get("/api/hackathons");

        const active = response.data.filter((h: Hackathon) => {
          if (!h.statut) return false;
          const s = h.statut.toLowerCase();
          return (
            s.includes("en cours") ||
            s.includes("actif") ||
            s === "test"
          );
        });

        setHackathons(active);
        if (active.length > 0) setSelectedHackathon(active[0]._id);
      } catch {
        toast.error("Impossible de charger les hackathons");
      } finally {
        setLoadingHackathons(false);
      }
    };

    fetchHackathons();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    forceRefreshConversations();
  }, [user, studentId]);

  useEffect(() => {
    const interval = setInterval(() => {
      forceRefreshConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    if (isFocusMode) setSidebarOpen(false);
  }, [isFocusMode]);

  const loadConversation = async (conversationId: string) => {
    if (isLoading || !studentId) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);

      if (response.data.conversation) {
        setCurrentConversation(response.data.conversation);
        if (response.data.conversation.statistiquesIA?.tokensTotal != null) {
          setTokensUsed(response.data.conversation.statistiquesIA.tokensTotal);
        } else {
          setTokensUsed(0);
        }
        setSelectedConversationId(conversationId);
        setSidebarOpen(false);
      } else {
        toast.error("Impossible de charger la conversation");
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    setCurrentConversation(null);
    setSelectedConversationId(null);
    setSidebarOpen(false);
    setTokensUsed(0);

    if (!selectedHackathon) {
      toast.error("Sélectionnez un hackathon avant de commencer");
      return;
    }

    try {
      const conversationResponse = await axios.post("/api/conversations", {
        studentId: studentId!,
        tacheId: defaultTacheId,
        groupId: defaultGroupId,
        hackathonId: selectedHackathon,
        titreConversation: `Conversation ${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR")}`,
        promptType: "one shot",
        modelName: "mistral",
      });

      const newId = conversationResponse.data.conversation._id;

      handleConversationCreated(newId);
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleSelectConversation = (id: string) => {
    if (selectedConversationId !== id) loadConversation(id);
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id);
    loadConversation(id);
    setRefreshConversations((prev) => prev + 1);
    toast.success("Nouvelle conversation créée");
  };

  const handleConversationDeleted = (id: string) => {
    if (selectedConversationId === id) {
      setCurrentConversation(null);
      setSelectedConversationId(null);
      setTokensUsed(0);
    }
  };

  const handleHackathonChange = (id: string) => {
    setSelectedHackathon(id);
    setCurrentConversation(null);
    setSelectedConversationId(null);
    setTokensUsed(0);
    forceRefreshConversations();
  };

  const handleSendPrompt = async (prompt: string) => {
    if (!selectedHackathon) return toast.error("Sélectionnez un hackathon");
    if (!selectedConversationId) return toast.error("Sélectionnez une conversation");

    setIsPromptLoading(true);
    setStreamedResponse("");
    setStreamingIndex(null);

    try {
      const modelName = "mistral";
      const maxTokens = 512;
      const temperature = 0.7;

      const currentMessagesCount = currentConversation?.messages?.length || 0;
      const nextPairIndex = Math.floor(currentMessagesCount / 2);

      // Optimistic UI: add user message + empty assistant message
      if (currentConversation) {
        const now = new Date();
        setCurrentConversation({
          ...currentConversation,
          messages: [
            ...currentConversation.messages,
            { role: "student", content: prompt, timestamp: now },
            { role: "assistant", content: "", timestamp: now, modelUsed: modelName },
          ],
        });
        setStreamingIndex(nextPairIndex);
      }

      const response = await fetch(
        `/api/conversations/${selectedConversationId}/ai-response?stream=1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            prompt,
            modelName,
            maxTokens,
            temperature,
          }),
        }
      );

      if (!response.body) {
        throw new Error("Streaming non disponible");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.replace(/^data:\s*/, "");
          if (data === "[DONE]") continue;
          try {
            const payload = JSON.parse(data);
            if (payload?.type === "delta" && payload?.content) {
              setStreamedResponse((prev) => prev + payload.content);
            }
            if (payload?.type === "error") {
              throw new Error(payload.message || "Erreur streaming");
            }
          } catch (err) {
            throw err;
          }
        }
      }

      await loadConversation(selectedConversationId);
      setStreamedResponse("");
      setStreamingIndex(null);
      toast.success("Message envoyé !");
    } catch {
      toast.error("Erreur d’envoi");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const hasVersionFinale = Boolean(
    currentConversation?.versionFinale?.promptFinal &&
    currentConversation?.versionFinale?.reponseIAFinale
  );
  const displayName = user?.prenom ? `${user.prenom} ${user.nom}` : "Étudiant Test";
  const isHackathonActive = Boolean(selectedHackathon);
  const selectedHackathonLabel =
    (hackathons ?? []).find((h) => h._id === selectedHackathon)?.nom ||
    "Aucun hackathon";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F6FA_100%)] overflow-hidden">
      
      {/* Bouton menu mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-slate-900 text-white shadow-[0_10px_30px_-12px_rgba(2,6,23,0.6)] border border-slate-700/40"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* SIDEBAR */}
      {studentId ? (
        <ConversationSidebar
          studentId={studentId}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onConversationDeleted={handleConversationDeleted}
          isMobileOpen={sidebarOpen}
          className="shadow-lg transition-all duration-300 ease-in-out"
          key={`sidebar-${refreshConversations}`}
          hackathonId={selectedHackathon}
          isOpen={sidebarOpen && !isFocusMode}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          tabLabel={isFocusMode ? "Afficher conversations" : "Conversations"}
        />
      ) : (
        <div className="w-80 bg-slate-900 text-white p-4 flex items-center justify-center">
          <LogoutButton />
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-[#F8FAFC]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_10%,rgba(56,189,248,0.04),transparent_70%)]" />

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 p-4 pl-14 md:pl-4">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-[#0F172A] to-cyan-400" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Select
                value={selectedHackathon}
                onValueChange={handleHackathonChange}
                disabled={loadingHackathons}
              >
                <SelectTrigger className="h-12 w-full max-w-[300px] rounded-2xl border border-slate-200 bg-white/95 px-4 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.2)] hover:bg-white focus:ring-2 focus:ring-cyan-400/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isHackathonActive
                          ? "bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.35)] hackathon-pulse"
                          : "bg-slate-400/70"
                      }`}
                    />
                    <div className="min-w-0 text-left leading-tight">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        Hackathon actif
                      </div>
                      <div className="text-sm font-semibold text-[#0F172A] truncate">
                        {selectedHackathonLabel}
                      </div>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {hackathons.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Aucun hackathon dispo
                    </SelectItem>
                  ) : (
                    hackathons.map((h) => (
                      <SelectItem key={h._id} value={h._id}>
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="truncate">{h.nom}</span>
                          {h._id === selectedHackathon && (
                            <Check className="h-4 w-4 text-cyan-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFocusMode((prev) => !prev)}
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.2)] hover:bg-white transition"
              >
                {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {isFocusMode ? "Quitter plein écran" : "Plein écran"}
              </button>

              <div className="relative z-40" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/95 rounded-full text-slate-100 border border-slate-800/80 shadow-[0_8px_24px_-16px_rgba(2,6,23,0.5)] hover:bg-slate-800/90 transition"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-semibold">
                  {displayName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900/95 border border-slate-800/80 shadow-[0_18px_50px_-32px_rgba(2,6,23,0.9)] p-1 backdrop-blur-md z-50"
                  role="menu"
                >
                  <div className="px-3 py-2 text-xs text-slate-400">
                    Connecté en tant que
                    <div className="text-sm text-slate-100 font-medium truncate">
                      {displayName}
                    </div>
                  </div>
                  <div className="h-px bg-slate-800 my-1" />
                  <Link
                    href="/dashboard/student/results"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/80 transition"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    Mes résultats
                  </Link>
                  <div className="h-px bg-slate-800 my-1" />
                  <LogoutButton
                    className="w-full justify-start px-3 py-2 rounded-lg bg-transparent text-slate-200 hover:bg-slate-800/80 hover:text-red-200 transition"
                    variant="ghost"
                  />
                </div>
              )}
            </div>
            </div>
          </div>

        </header>

        {/* CONTENU */}
        <div className="relative flex-1 overflow-hidden p-4 md:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(56,189,248,0.035),transparent_70%)]" />

          <div className="mx-auto flex w-full max-w-[1100px] flex-col h-full gap-6">
            <div className="flex-1 overflow-y-auto pr-1">
              {selectedHackathon ? (
                hasVersionFinale ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_-30px_rgba(2,6,23,0.6)] border border-slate-200/80">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Version finale soumise
                      </h2>
                      <button
                        onClick={() => window.open(`/version-finale/${selectedConversationId}`, "_blank")}
                        className="bg-cyan-600 text-white px-6 py-2 rounded-lg shadow-[0_10px_30px_-16px_rgba(8,145,178,0.8)] hover:bg-cyan-500 transition"
                      >
                        Voir la version finale
                      </button>
                    </div>
                  </div>
                ) : (
                  <ChatInterface
                    existingConversation={currentConversation}
                    onConfigValidatedChange={setIsChatReady}
                    onTokensChange={setTokensUsed}
                    streamingIndex={streamingIndex}
                    streamedResponse={streamedResponse}
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_-30px_rgba(2,6,23,0.6)] border border-slate-200/80">
                    <h2 className="text-2xl font-semibold text-[#0F172A] mb-3">
                      Bienvenue dans votre espace IA
                    </h2>
                    <p className="text-slate-600">
                      Sélectionnez une conversation ou créez-en une nouvelle pour commencer.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedHackathon && selectedConversationId && !hasVersionFinale && isChatReady && (
              <div className="sticky bottom-0 z-30">
                <FixedPromptInput
                  onSendPrompt={handleSendPrompt}
                  isLoading={isPromptLoading}
                  tokensUsed={tokensUsed}
                  position="static"
                />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* La languette de la sidebar sert de rappel en mode plein écran */}

      {/* INPUT FIXE EN BAS */}
    </div>
  );
}
