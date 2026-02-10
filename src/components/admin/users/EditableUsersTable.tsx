"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Edit, PlusCircle, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { UserCreateForm } from "./UserCreateForm";
import { UserEditForm } from "./UserEditForm";
import { UserImportForm } from "./UserImportForm";

type RoleKey =
  | "student"
  | "examiner"
  | "admin"
  | "etudiant"
  | "examinateur"
  | "";

type User = {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  role: RoleKey;
  numeroEtudiant?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// étiquettes FR et EN
const ROLE_LABELS: Record<RoleKey, string> = {
  "": "",
  student: "Étudiant",
  etudiant: "Étudiant",
  examiner: "Examinateur",
  examinateur: "Examinateur",
  admin: "Administrateur",
};

export function EditableUsersTable() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "student" | "etudiant" | "examiner" | "examinateur" | "admin" | "autres"
  >("student");
  const { data: users = [], mutate } = useSWR<User[]>("/api/users", fetcher);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = users.filter((user) => {
    const matchesSearch =
      (user.nom ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (user.prenom ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email ?? "").toLowerCase().includes(search.toLowerCase());

    if (activeTab === "autres") {
      return (
        matchesSearch &&
        !["student", "etudiant", "examiner", "examinateur", "admin"].includes(
          user.role
        )
      );
    }

    // Pour tenir compte des deux nomenclatures
    if (activeTab === "student" || activeTab === "etudiant") {
      return (
        matchesSearch && (user.role === "student" || user.role === "etudiant")
      );
    }
    if (activeTab === "examiner" || activeTab === "examinateur") {
      return (
        matchesSearch &&
        (user.role === "examiner" || user.role === "examinateur")
      );
    }

    return matchesSearch && user.role === activeTab;
  });

  const handleEdit = (userId: string) => {
    setEditingUserId(userId);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const data = await res.json();
      mutate();
      toast.success("Succès", {
        description: data.message || "Utilisateur supprimé",
      });
    } else {
      const errorData = await res.json();
      toast.error("Erreur", {
        description: errorData.error || "Impossible de supprimer l'utilisateur",
      });
    }
  };

  const openDeleteDialog = (id: string) => {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await handleDelete(pendingDeleteId);
    setConfirmDeleteOpen(false);
    setPendingDeleteId(null);
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
    // TODO: Implémenter le dialogue d'import CSV
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    // TODO: Implémenter le dialogue de création
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
          <Input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            onClick={handleImport}
            className="flex w-full items-center justify-center gap-2 border-slate-200 text-slate-700 hover:border-cyan-400/40 hover:text-slate-900 sm:w-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Importer CSV</span>
          </Button>

          <Button
            onClick={handleCreate}
            className="flex w-full items-center justify-center gap-2 bg-[#0F172A] text-white hover:bg-[#1E293B] sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer un utilisateur</span>
          </Button>
        </div>
      </div>

      <div className="mt-2 -mx-2 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/80 p-2 px-2 sm:mx-0 sm:flex-wrap sm:overflow-visible">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("student")}
          size="sm"
          className={`rounded-xl px-4 whitespace-nowrap ${
            activeTab === "student" || activeTab === "etudiant"
              ? "bg-cyan-500/15 text-cyan-700"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Étudiants
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("examiner")}
          size="sm"
          className={`rounded-xl px-4 whitespace-nowrap ${
            activeTab === "examiner" || activeTab === "examinateur"
              ? "bg-cyan-500/15 text-cyan-700"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Examinateurs
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("admin")}
          size="sm"
          className={`rounded-xl px-4 whitespace-nowrap ${
            activeTab === "admin"
              ? "bg-cyan-500/15 text-cyan-700"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Administrateurs
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("autres")}
          size="sm"
          className={`rounded-xl px-4 whitespace-nowrap ${
            activeTab === "autres"
              ? "bg-cyan-500/15 text-cyan-700"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Autres
        </Button>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((user) => (
          <div
            key={user._id}
            className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-slate-600 truncate">{user.email}</p>
              </div>
              <span className="shrink-0 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-700">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(user._id)}
                className="h-9 flex-1 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-cyan-400/40"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(user._id)}
                className="h-9 flex-1 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-center text-sm text-slate-500">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-auto bg-white/90">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Nom
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Prénom
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Email
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Rôle
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user._id}
                className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-slate-800">{user.nom}</td>
                <td className="py-3 px-4 text-sm text-slate-800">{user.prenom}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{user.email}</td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {ROLE_LABELS[user.role] || user.role}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user._id)}
                      className="h-9 w-9 p-0 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-cyan-400/40"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(user._id)}
                      className="h-9 w-9 p-0 rounded-full border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Les dialogues seront implémentés ultérieurement */}
      {isImportDialogOpen && (
        <UserImportForm
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onSuccess={() => {
            setIsImportDialogOpen(false);
            mutate();
          }}
        />
      )}

      {isCreateDialogOpen && (
        <UserCreateForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            mutate();
          }}
        />
      )}

      {editingUserId && (
        <UserEditForm
          userId={editingUserId}
          isOpen={!!editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={() => {
            setEditingUserId(null);
            mutate();
          }}
        />
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="w-[92vw] max-w-[420px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
