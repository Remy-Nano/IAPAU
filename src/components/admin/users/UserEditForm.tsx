"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditFormData, userEditValidationSchema } from "@/types/userValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { UserModal } from "./UserModal";

interface UserEditFormProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function UserEditForm({
  userId,
  isOpen,
  onClose,
  onSuccess,
}: UserEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: user, error } = useSWR(
    isOpen ? `/api/users/${userId}` : null,
    fetcher
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(userEditValidationSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "", // Champ vide pour ne pas modifier le mot de passe
      role: "student",
    },
  });

  useEffect(() => {
    if (user) {
      // Ne pas inclure le mot de passe
      reset({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        password: "",
        role: user.role,
        dateNaissance: user.dateNaissance
          ? new Date(user.dateNaissance).toISOString().split("T")[0]
          : undefined,
        numeroEtudiant: user.numeroEtudiant,
      });
    }
  }, [user, reset]);

  const selectedRole = watch("role");

  const onSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    try {
      // Si le mot de passe est vide, on le supprime pour ne pas le modifier
      const dataToSend = { ...data } as Partial<EditFormData>;
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Erreur", {
          description: errorData.error || "Une erreur est survenue",
        });
        return;
      }

      toast.success("Succès", {
        description: "Utilisateur mis à jour avec succès",
      });
      onSuccess();
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour soumettre le formulaire avec gestion des erreurs de validation
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

  if (error) {
    return (
      <UserModal isOpen={isOpen} onClose={onClose} title="Erreur">
        <div className="text-red-500">
          Impossible de charger les informations de l&apos;utilisateur.
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </UserModal>
    );
  }

  if (!user) {
    return (
      <UserModal
        isOpen={isOpen}
        onClose={onClose}
        title="Modifier l'utilisateur"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </UserModal>
    );
  }

  return (
    <UserModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modifier l'utilisateur: ${user.prenom} ${user.nom}`}
    >
      <form onSubmit={submitForm} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Prénom
            </label>
            <Input
              type="text"
              {...register("prenom")}
              className={`rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 ${
                errors.prenom ? "border-red-500" : ""
              }`}
              placeholder="Entrez le prénom"
            />
            {errors.prenom && (
              <p className="text-red-500 text-sm">{errors.prenom.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Nom
            </label>
            <Input
              type="text"
              {...register("nom")}
              className={`rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 ${
                errors.nom ? "border-red-500" : ""
              }`}
              placeholder="Entrez le nom"
            />
            {errors.nom && (
              <p className="text-red-500 text-sm">{errors.nom.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Email
            </label>
            <Input
              type="email"
              {...register("email")}
              className={`rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="exemple@domaine.fr"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Mot de passe (laisser vide pour ne pas modifier)
            </label>
            <Input
              type="password"
              {...register("password")}
              className={`rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Rôle
            </label>
            <select
              {...register("role")}
              className={`w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 ${
                errors.role ? "border-red-500" : ""
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
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Numéro étudiant
              </label>
              <Input
                type="text"
                {...register("numeroEtudiant")}
                className={`rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 ${
                  errors.numeroEtudiant ? "border-red-500" : ""
                }`}
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
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Date de naissance
            </label>
            <Input
              type="date"
              {...register("dateNaissance")}
              className={`rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 ${
                errors.dateNaissance ? "border-red-500" : ""
              }`}
            />
            {errors.dateNaissance && (
              <p className="text-red-500 text-sm">
                {errors.dateNaissance.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-700"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
          >
            {isSubmitting
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </UserModal>
  );
}
