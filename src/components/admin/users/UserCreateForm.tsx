"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormData, userValidationSchema } from "@/types/userValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserModal } from "./UserModal";

interface UserCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserCreateForm({
  isOpen,
  onClose,
  onSuccess,
}: UserCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userValidationSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Erreur", {
          description: errorData.error || "Une erreur est survenue",
        });
        return;
      }

      toast.success("Succès", {
        description: "Utilisateur créé avec succès",
      });
      reset();
      onSuccess();
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la création",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour soumettre le formulaire
  const submitForm = handleSubmit(onSubmit, (errors) => {
    // Afficher un toast avec les erreurs de validation
    const errorsList = Object.values(errors)
      .map((error) => error.message)
      .filter(Boolean);

    if (errorsList.length > 0) {
      toast.error("Erreur de validation", {
        description: errorsList.join(", "),
      });
    }
  });

  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un nouvel utilisateur"
    >
      <form onSubmit={submitForm} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prénom</label>
            <Input
              type="text"
              {...register("prenom")}
              className={errors.prenom ? "border-red-500" : ""}
              placeholder="Entrez le prénom"
            />
            {errors.prenom && (
              <p className="text-red-500 text-sm">{errors.prenom.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input
              type="text"
              {...register("nom")}
              className={errors.nom ? "border-red-500" : ""}
              placeholder="Entrez le nom"
            />
            {errors.nom && (
              <p className="text-red-500 text-sm">{errors.nom.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
              placeholder="exemple@domaine.fr"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          {selectedRole !== "student" && selectedRole !== "etudiant" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe</label>
              <Input
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}
          {(selectedRole === "student" || selectedRole === "etudiant") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Mot de passe
              </label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  ℹ️ Les étudiants utilisent un lien magique pour se connecter.
                  Aucun mot de passe requis.
                </p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rôle</label>
            <select
              {...register("role")}
              className={`w-full p-2 border rounded-md ${
                errors.role ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="student">Étudiant</option>
              <option value="examiner">Examinateur</option>
              <option value="admin">Administrateur</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div>
          {(selectedRole === "student" || selectedRole === "etudiant") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro étudiant</label>
              <Input
                type="text"
                {...register("numeroEtudiant")}
                className={errors.numeroEtudiant ? "border-red-500" : ""}
                placeholder="Optionnel"
              />
              {errors.numeroEtudiant && (
                <p className="text-red-500 text-sm">
                  {errors.numeroEtudiant.message}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de naissance</label>
            <Input
              type="date"
              {...register("dateNaissance")}
              className={errors.dateNaissance ? "border-red-500" : ""}
            />
            {errors.dateNaissance && (
              <p className="text-red-500 text-sm">
                {errors.dateNaissance.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer l'utilisateur"}
          </Button>
        </div>
      </form>
    </UserModal>
  );
}
