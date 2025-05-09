"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormData, userValidationSchema } from "../types/userValidation";

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
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

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la création",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Utilisateur créé avec succès",
        variant: "default",
      });
      router.push("/admin/users");
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Erreur lors de la création",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Ajouter un utilisateur
          </h1>
          <Link href="/admin/users">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
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
              <Button type="submit">Créer l&apos;utilisateur</Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
