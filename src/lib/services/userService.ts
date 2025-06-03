import { User } from "@/lib/models/user";
import { normalizeRole } from "@/lib/utils/roleUtils";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
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
  if (!prenom || !nom || !email || !password) {
    throw new Error("Prénom, nom, email et mot de passe sont requis");
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

  // Hash du mot de passe
  const passwordHash = await bcrypt.hash(password, 10);
  const roleKey = normalizeRole(role ?? "");

  // Création de l'utilisateur
  const newUser = await User.create({
    prenom,
    nom,
    email,
    dateNaissance,
    passwordHash,
    role: roleKey || "student", // Valeur par défaut
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
