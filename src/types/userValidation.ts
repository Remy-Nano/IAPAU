import { z } from "zod";

export function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString
  );
}

export const userValidationSchema = z
  .object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    email: z
      .string()
      .email("Format d'email invalide")
      .min(1, "L'email est requis"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .optional()
      .or(z.literal("")),
    role: z.enum([
      "student",
      "examiner",
      "admin",
      "etudiant",
      "examinateur",
      "",
    ]),
    dateNaissance: z
      .string()
      .optional()
      .transform((val) => (val ? val : undefined))
      .refine((val) => !val || isValidDate(val), {
        message: "Format de date invalide (YYYY-MM-DD)",
      }),
    numeroEtudiant: z
      .string()
      .optional()
      .transform((val) => (val ? val : undefined))
      .refine((val) => !val || val.length >= 8, {
        message: "Le numéro étudiant doit contenir au moins 8 caractères",
      }),
  })
  .strict()
  .refine(
    (data) => {
      // Mot de passe obligatoire pour examinateurs et admins
      if (
        (data.role === "examiner" ||
          data.role === "examinateur" ||
          data.role === "admin") &&
        (!data.password || data.password.length < 6)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Un mot de passe de 6 caractères minimum est requis pour les examinateurs et administrateurs",
      path: ["password"],
    }
  );

export type FormData = z.infer<typeof userValidationSchema>;

// Pour l'édition où le mot de passe est optionnel
export const userEditValidationSchema = z
  .object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    email: z
      .string()
      .email("Format d'email invalide")
      .min(1, "L'email est requis"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .optional()
      .or(z.literal("")),
    role: z.enum([
      "student",
      "examiner",
      "admin",
      "etudiant",
      "examinateur",
      "",
    ]),
    dateNaissance: z
      .string()
      .optional()
      .transform((val) => (val ? val : undefined))
      .refine((val) => !val || isValidDate(val), {
        message: "Format de date invalide (YYYY-MM-DD)",
      }),
    numeroEtudiant: z
      .string()
      .optional()
      .transform((val) => (val ? val : undefined))
      .refine((val) => !val || val.length >= 8, {
        message: "Le numéro étudiant doit contenir au moins 8 caractères",
      }),
  })
  .strict();

export type EditFormData = z.infer<typeof userEditValidationSchema>;
