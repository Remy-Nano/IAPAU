import { formatDistanceToNow } from "date-fns";
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
