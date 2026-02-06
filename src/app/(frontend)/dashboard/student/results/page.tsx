"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Award, Loader2, Star, Trophy } from "lucide-react";
import Link from "next/link";

interface ConversationWithNote {
  _id: string;
  titreConversation?: string;

  hackathonId?: string | { _id: string; nom: string } | null;

  createdAt?: string;

  versionFinale?: {
    evaluationEtudiant?: {
      note?: number;
      comment?: string;
      examinerId?: string;
      date?: string;
    } | null;
  };
}

interface Hackathon {
  _id: string;
  nom: string;
}

export default function StudentResultsPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationWithNote[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "note">("date");
  const [period, setPeriod] = useState<"7j" | "30j" | "all">("all");

  // Map id -> nom (très pratique pour afficher)
  const hackathonNameById = useMemo(() => {
    const map = new Map<string, string>();
    hackathons.forEach((h) => map.set(h._id, h.nom));
    return map;
  }, [hackathons]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);

        // 1) Conversations de l'étudiant (ton endpoint actuel)
        const convRes = await axios.get(
          `/api/conversations/student/${user._id}?includeMessages=false&includeStats=true`
        );

        const allConversations: ConversationWithNote[] =
          convRes.data?.conversations || [];

        // 2) Liste des hackathons (pour récupérer les noms)
        const hackRes = await axios.get(`/api/hackathons`);
        const allHackathons: Hackathon[] = Array.isArray(hackRes.data)
          ? hackRes.data
          : hackRes.data?.hackathons || [];

        setHackathons(allHackathons);

        // 3) On garde uniquement celles notées
        const withNotes = allConversations.filter((conv) => {
          const note = conv?.versionFinale?.evaluationEtudiant?.note;
          return note !== null && note !== undefined;
        });

        setConversations(withNotes);
      } catch (error) {
        console.error("Erreur chargement des résultats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user?._id]);

  const filteredConversations = useMemo(() => {
    let items = [...conversations];

    if (selectedHackathon !== "all") {
      items = items.filter((conv) => {
        if (typeof conv.hackathonId === "object" && conv.hackathonId) {
          return conv.hackathonId._id === selectedHackathon;
        }
        if (typeof conv.hackathonId === "string") {
          return conv.hackathonId === selectedHackathon;
        }
        return false;
      });
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((conv) => {
        const evalEtudiant = conv?.versionFinale?.evaluationEtudiant;
        const appreciation = evalEtudiant?.comment?.toLowerCase() || "";
        const title = (conv.titreConversation || "").toLowerCase();
        let hackathonNom = "";
        if (typeof conv.hackathonId === "object" && conv.hackathonId) {
          hackathonNom = conv.hackathonId.nom || "";
        } else if (typeof conv.hackathonId === "string") {
          hackathonNom = hackathonNameById.get(conv.hackathonId) || "";
        }
        return (
          title.includes(q) ||
          appreciation.includes(q) ||
          hackathonNom.toLowerCase().includes(q)
        );
      });
    }

    if (period !== "all") {
      const days = period === "7j" ? 7 : 30;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      items = items.filter((conv) => {
        const date = conv?.versionFinale?.evaluationEtudiant?.date || conv.createdAt;
        if (!date) return false;
        return new Date(date).getTime() >= cutoff;
      });
    }

    items.sort((a, b) => {
      if (sortBy === "note") {
        const aNote = a?.versionFinale?.evaluationEtudiant?.note ?? -1;
        const bNote = b?.versionFinale?.evaluationEtudiant?.note ?? -1;
        return Number(bNote) - Number(aNote);
      }
      const aDate = a?.versionFinale?.evaluationEtudiant?.date || a.createdAt;
      const bDate = b?.versionFinale?.evaluationEtudiant?.date || b.createdAt;
      return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
    });

    return items;
  }, [conversations, selectedHackathon, query, sortBy, period, hackathonNameById]);

  const notes = filteredConversations
    .map((conv) => conv?.versionFinale?.evaluationEtudiant?.note)
    .filter((note): note is number => typeof note === "number");
  const average =
    notes.length > 0
      ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10
      : null;
  const best = notes.length > 0 ? Math.max(...notes) : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_500px_at_20%_0%,#e0f2fe_0%,#f3f6fa_45%,#eef2f7_100%)]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Tableau de bord / Mes résultats
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Mes résultats
            </h1>
          </div>
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.2)] hover:border-cyan-400/40 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </div>

      {!user?._id ? (
        <div className="text-center text-slate-600">
          Veuillez vous reconnecter.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement de vos résultats...
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 text-center shadow-[0_20px_60px_-30px_rgba(2,6,23,0.4)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-700">
            <Star className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Aucun résultat pour le moment
          </h2>
          <p className="text-slate-600">
            Vous verrez vos notes ici dès qu&apos;une version finale sera évaluée.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="inline-flex rounded-full bg-white/80 border border-slate-200 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.2)] p-1">
              {(["7j", "30j", "all"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${
                    period === p
                      ? "bg-cyan-500/15 text-cyan-700"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p === "all" ? "Tout" : p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-[0_16px_40px_-30px_rgba(2,6,23,0.4)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-700 flex items-center justify-center">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Résultats publiés</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {filteredConversations.length}
                  </p>
                  <p className="text-xs text-slate-400">
                    sur la période sélectionnée
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-[0_16px_40px_-30px_rgba(2,6,23,0.4)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-700 flex items-center justify-center">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Moyenne</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {average !== null ? `${average} / 10` : "—"}
                  </p>
                  <p className="text-xs text-slate-400">
                    sur la période sélectionnée
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-[0_16px_40px_-30px_rgba(2,6,23,0.4)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-700 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Meilleure note</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {best !== null ? `${best} / 10` : "—"}
                  </p>
                  <p className="text-xs text-slate-400">
                    sur la période sélectionnée
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-[0_24px_60px_-34px_rgba(2,6,23,0.4)]">
            <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un hackathon, une appréciation…"
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <label className="group relative flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600">
                    Hackathon
                    <span className="text-slate-400">▾</span>
                    <select
                      value={selectedHackathon}
                      onChange={(e) => setSelectedHackathon(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    >
                      <option value="all">Tous</option>
                      {hackathons.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.nom}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  onClick={() => setSortBy("date")}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                    sortBy === "date"
                      ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                      : "border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Trier par date
                </button>
                <button
                  onClick={() => setSortBy("note")}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                    sortBy === "note"
                      ? "bg-cyan-500/15 text-cyan-700 border-cyan-500/30"
                      : "border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Trier par note
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
              <thead className="bg-slate-50/90 text-slate-600 sticky top-0">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Hackathon
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Conversation
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Note
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Appréciation
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredConversations.map((conv) => {
                const evalEtudiant = conv?.versionFinale?.evaluationEtudiant;

                const note =
                  evalEtudiant?.note !== undefined && evalEtudiant?.note !== null
                    ? Number(evalEtudiant.note)
                    : null;

                const appreciation = evalEtudiant?.comment?.trim() || "Non renseigné";

                // ✅ Hackathon name (3 cas: populated object, string id, null)
                let hackathonNom = "Non renseigné";
                if (typeof conv.hackathonId === "object" && conv.hackathonId) {
                  hackathonNom = conv.hackathonId.nom || "—";
                } else if (typeof conv.hackathonId === "string") {
                  hackathonNom = hackathonNameById.get(conv.hackathonId) || "Non renseigné";
                }

                const dateText =
                  evalEtudiant?.date || conv.createdAt
                    ? new Date(
                        evalEtudiant?.date || (conv.createdAt as string)
                      ).toLocaleString("fr-FR")
                    : "Non renseigné";

                return (
                  <tr
                    key={conv._id}
                    className="border-t border-slate-200/70 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-800">{hackathonNom}</td>
                    <td className="px-5 py-3 text-slate-800">
                      {conv.titreConversation || "Non renseigné"}
                    </td>
                    <td className="px-5 py-3">
                      {note !== null ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            note >= 8
                              ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                              : note >= 6
                              ? "bg-amber-400/20 text-amber-700 border border-amber-400/30"
                              : "bg-rose-500/15 text-rose-700 border border-rose-500/30"
                          }`}
                        >
                          {note} / 10
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      <span className="line-clamp-3 text-slate-600">
                        {appreciation}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{dateText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
