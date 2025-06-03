// src/lib/utils/roleUtils.ts

// Variantes valides pour chaque rôle (FR + alias anglais)
const VALID_ROLES = {
  etudiant: ["etudiant", "etudiants", "student", "students"] as string[],
  examinateur: [
    "examinateur",
    "examinateurs",
    "examiner",
    "examiners",
  ] as string[],
  admin: ["admin", "admins", "administrateur", "administrateurs"] as string[],
} as const;

export type RoleKey =
  | "student"
  | "examiner"
  | "admin"
  | "etudiant"
  | "examinateur"
  | "";

export function parseRole(raw: string): RoleKey {
  const normalized = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

  if (VALID_ROLES.etudiant.includes(normalized)) return "etudiant";
  if (VALID_ROLES.examinateur.includes(normalized)) return "examinateur";
  if (VALID_ROLES.admin.includes(normalized)) return "admin";
  return "";
}

export function normalizeRole(
  raw: string
): "student" | "examiner" | "admin" | "etudiant" | "examinateur" | "" {
  const r = raw.trim().toLowerCase();
  if (["etudiant", "student"].includes(r))
    return r === "etudiant" ? "etudiant" : "student";
  if (["examinateur", "examiner"].includes(r))
    return r === "examinateur" ? "examinateur" : "examiner";
  if (["admin", "administrateur"].includes(r)) return "admin";
  return "";
}
