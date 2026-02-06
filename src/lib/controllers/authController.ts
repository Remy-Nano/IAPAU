// src/lib/controllers/authController.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("🛑 JWT_SECRET non défini dans .env");
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: Omit<IUser, "passwordHash">;
}

export async function login({
  email,
  password,
}: LoginPayload): Promise<LoginResult> {
  // 1. Récupérer l'utilisateur
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  // 2. Vérifier le mot de passe
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Mot de passe invalide");
  }

  // 3. Générer un JWT (durée 1h)
  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 4. Supprimer passwordHash de l’objet renvoyé
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutHash } = user.toObject();

  return {
    token,
    user: userWithoutHash as Omit<IUser, "passwordHash">,
  };
}
