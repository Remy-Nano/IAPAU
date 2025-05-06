import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formate une date en temps relatif (ex: "il y a 5 minutes")
 */
export function formatRelativeTime(date?: Date | string): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  try {
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: fr,
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "";
  }
}

/**
 * Formate une date en format lisible (ex: "15 mai 2023 à 14:30")
 */
export function formatDate(date?: Date | string): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  try {
    // Utiliser un format simple sans caractères spéciaux
    return format(dateObj, "dd MMMM yyyy à HH:mm", {
      locale: fr,
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "";
  }
}
