export type Role = 'etudiant' | 'examinateur' | 'admin';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  dateNaissance?: string;
  numeroEtudiant?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: Role;
  dateNaissance?: string;
  numeroEtudiant?: string;
}
