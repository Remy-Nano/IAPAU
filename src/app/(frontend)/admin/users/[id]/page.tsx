"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FormData, userValidationSchema } from "@/types/userValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const { data: user, error, mutate } = useSWR(`/api/users/${userId}`, fetcher);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (user) {
      // On ne réinitialise pas le champ password car l'API ne renvoie pas ce champ
      reset({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        dateNaissance: user.dateNaissance
          ? new Date(user.dateNaissance).toISOString().split("T")[0]
          : undefined,
        numeroEtudiant: user.numeroEtudiant,
      });
    }
  }, [user, reset]);

  const selectedRole = watch("role");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      // Si le mot de passe est vide, on le supprime pour ne pas le mettre à jour
      const dataToSend = { ...data } as Partial<FormData>;
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la mise à jour",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès",
        variant: "default",
      });
      mutate();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la suppression",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
        variant: "default",
      });
      router.push("/admin/users");
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-500">
              Erreur: Impossible de charger l&apos;utilisateur
            </p>
            <Link href="/admin/users">
              <Button variant="outline" className="mt-4">
                Retour à la liste
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p>Chargement...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Modifier l&apos;utilisateur
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
            <Link href="/admin/users">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  type="text"
                  {...register("prenom")}
                  className={errors.prenom ? "border-red-500" : ""}
                  placeholder="Entrez le prénom"
                />
                {errors.prenom && (
                  <p className="text-red-500 text-sm">
                    {errors.prenom.message}
                  </p>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mot de passe (laisser vide pour ne pas modifier)
                </label>
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
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
