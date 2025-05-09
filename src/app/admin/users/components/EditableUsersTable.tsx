"use client";

import { Button } from "@/components/ui/button";
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

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(search.toLowerCase()) ||
      user.prenom.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

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
            className="w-full md:w-64"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleImport}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importer CSV</span>
          </Button>

          <Button onClick={handleCreate} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Créer un utilisateur</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant={
            activeTab === "student" || activeTab === "etudiant"
              ? "default"
              : "outline"
          }
          onClick={() => setActiveTab("student")}
          size="sm"
        >
          Étudiants
        </Button>
        <Button
          variant={
            activeTab === "examiner" || activeTab === "examinateur"
              ? "default"
              : "outline"
          }
          onClick={() => setActiveTab("examiner")}
          size="sm"
        >
          Examinateurs
        </Button>
        <Button
          variant={activeTab === "admin" ? "default" : "outline"}
          onClick={() => setActiveTab("admin")}
          size="sm"
        >
          Administrateurs
        </Button>
        <Button
          variant={activeTab === "autres" ? "default" : "outline"}
          onClick={() => setActiveTab("autres")}
          size="sm"
        >
          Autres
        </Button>
      </div>

      <div className="border rounded-md overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="py-3 px-4 text-left font-medium">Nom</th>
              <th className="py-3 px-4 text-left font-medium">Prénom</th>
              <th className="py-3 px-4 text-left font-medium">Email</th>
              <th className="py-3 px-4 text-left font-medium">Rôle</th>
              <th className="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user._id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                <td className="py-3 px-4">{user.nom}</td>
                <td className="py-3 px-4">{user.prenom}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  {ROLE_LABELS[user.role] || user.role}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user._id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
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
    </div>
  );
}
