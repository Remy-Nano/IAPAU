"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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

  if (!user?._id) {
    return (
      <div className="p-6 text-center text-slate-600">
        Veuillez vous reconnecter.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement de vos résultats...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Mes résultats</h1>
        <Link
          href="/dashboard/student"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Retour au tableau de bord
        </Link>
      </div>

      {conversations.length === 0 ? (
        <p className="text-slate-500">
          Vous n&apos;avez pas encore de résultats disponibles.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Hackathon
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Conversation
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Note
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Appréciation
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {conversations.map((conv) => {
                const evalEtudiant = conv?.versionFinale?.evaluationEtudiant;

                const note =
                  evalEtudiant?.note !== undefined && evalEtudiant?.note !== null
                    ? Number(evalEtudiant.note)
                    : null;

                const appreciation = evalEtudiant?.comment?.trim() || "—";

                // ✅ Hackathon name (3 cas: populated object, string id, null)
                let hackathonNom = "—";
                if (typeof conv.hackathonId === "object" && conv.hackathonId) {
                  hackathonNom = conv.hackathonId.nom || "—";
                } else if (typeof conv.hackathonId === "string") {
                  hackathonNom = hackathonNameById.get(conv.hackathonId) || "—";
                }

                const dateText =
                  evalEtudiant?.date || conv.createdAt
                    ? new Date(
                        evalEtudiant?.date || (conv.createdAt as string)
                      ).toLocaleString("fr-FR")
                    : "—";

                return (
                  <tr key={conv._id} className="border-t">
                    <td className="px-4 py-2">{hackathonNom}</td>
                    <td className="px-4 py-2">
                      {conv.titreConversation || "—"}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      {note !== null ? `${note} / 10` : "—"}
                    </td>
                    <td className="px-4 py-2 max-w-xs">
                      <span className="line-clamp-3 text-slate-600">
                        {appreciation}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{dateText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}