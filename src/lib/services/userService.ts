import { User } from "@/lib/models/user";
import { normalizeRole } from "@/lib/utils/roleUtils";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  prenom: string;
  nom: string;
  email: string;
  password?: string; // Optionnel pour les étudiants
  dateNaissance?: string;
  role?: string;
  numeroEtudiant?: string;
}

export async function createUser(data: CreateUserData) {
  const {
    prenom,
    nom,
    email,
    password,
    dateNaissance: dateStr,
    role,
    numeroEtudiant,
  } = data;

  // Validation des champs obligatoires
  if (!prenom || !nom || !email) {
    throw new Error("Prénom, nom et email sont requis");
  }

  const roleKey = normalizeRole(role ?? "") || "student";

  // Validation du mot de passe selon le rôle
  if (
    (roleKey === "examiner" ||
      roleKey === "examinateur" ||
      roleKey === "admin") &&
    !password
  ) {
    throw new Error(
      "Un mot de passe est requis pour les examinateurs et administrateurs"
    );
  }

  // Vérification si l'email existe déjà
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new Error(`L'email ${email} est déjà utilisé`);
  }

  // Parsing de la date si fournie
  let dateNaissance = undefined;
  if (dateStr) {
    dateNaissance = new Date(dateStr);
    if (isNaN(dateNaissance.getTime())) {
      throw new Error("Date de naissance invalide");
    }
  }

  // Générer un mot de passe par défaut pour les étudiants si non fourni
  const finalPassword = password || "magic_link_user_no_password_needed";

  // Hash du mot de passe
  const passwordHash = await bcrypt.hash(finalPassword, 10);

  // Création de l'utilisateur
  const newUser = await User.create({
    prenom,
    nom,
    email,
    dateNaissance,
    passwordHash,
    role: roleKey, // Déjà défini plus haut avec valeur par défaut
    numeroEtudiant: numeroEtudiant || "",
    tokensAuthorized: 0,
    tokensUsed: 0,
    magicLink: { token: "", expiresAt: new Date() },
    profilEtudiant: { niveauFormation: "", typeEtude: "", groupId: null },
    profilJury: {
      niveauDiplome: "",
      posteOccupe: "",
      secteurActivite: "",
      anneesExperience: 0,
      nombreETPEmployeur: 0,
      expertises: [],
    },
    consentementRGPD: false,
  });

  return newUser;
}

export async function getAllUsers() {
  return await User.find().lean();
}
