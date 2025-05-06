// src/lib/controllers/userController.ts
import { IUser, User } from "@/lib/models/user";
import bcrypt from "bcrypt";

export interface RegisterPayload {
  prenom?: string;
  nom?: string;
  email: string;
  password: string;
  role?: "student" | "examiner" | "admin";
}

export interface RegisterResult {
  user: Omit<IUser, "passwordHash">;
}

export async function register({
  prenom,
  nom,
  email,
  password,
  role = "student",
}: RegisterPayload): Promise<RegisterResult> {
  // 1. Vérifier que l’email n’est pas déjà pris
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Cet email est déjà enregistré");
  }

  // 2. Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Créer l’utilisateur
  const created = await User.create({
    prenom,
    nom,
    email,
    passwordHash,
    role,
  });

  // 4. Supprimer le mot de passe du résultat
  // On récupère l’objet typé IUser
  const userObj = created.toObject() as IUser;
  // On supprime proprement le passwordHash
  delete (userObj as Partial<IUser>).passwordHash;
  // On retourne directement avec le bon type
  return {
    user: userObj as Omit<IUser, "passwordHash">,
  };
}
