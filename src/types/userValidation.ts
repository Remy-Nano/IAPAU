import { z } from 'zod';

export function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString;
}

export const userValidationSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string()
    .email("Format d'email invalide")
    .min(1, "L'email est requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(['etudiant', 'examinateur', 'admin']),
  dateNaissance: z.string()
    .optional()
    .transform((val) => val ? val : undefined)
    .refine((val) => !val || isValidDate(val), {
      message: "Format de date invalide (YYYY-MM-DD)"
    }),
  numeroEtudiant: z.string()
    .optional()
    .transform((val) => val ? val : undefined)
    .refine((val) => !val || val.length >= 8, {
      message: "Le numéro étudiant doit contenir au moins 8 caractères"
    })
}).strict();

export type FormData = z.infer<typeof userValidationSchema>;
