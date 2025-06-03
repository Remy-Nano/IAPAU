"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { UserModal } from "./UserModal";

interface UserImportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserImportForm({
  isOpen,
  onClose,
  onSuccess,
}: UserImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Erreur", {
        description: "Veuillez sélectionner un fichier CSV",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/users/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Erreur", {
          description: errorData.error || "Une erreur est survenue",
        });
        return;
      }

      const data = await response.json();
      toast.success("Succès", {
        description: `${data.imported} utilisateurs importés avec succès`,
      });
      onSuccess();
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'import",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      title="Importer des utilisateurs"
    >
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Sélectionnez un fichier CSV
          </label>
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Format attendu:
            nom,prenom,email,mot_de_passe,role,date_naissance,numero_etudiant
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || !file}>
            {isSubmitting ? "Importation..." : "Importer"}
          </Button>
        </div>
      </form>
    </UserModal>
  );
}
