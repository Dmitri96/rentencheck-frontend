/**
 * Client-related utility functions
 * Shared helper functions for client data formatting and status handling
 */

/**
 * Badge variant for a client's active state — maps to the token-backed
 * Badge component (success | outline) rather than raw Tailwind classes.
 */
export type StatusVariant = "default" | "success" | "warning" | "destructive" | "outline";

export function getClientStatusVariant(isActive: boolean): StatusVariant {
  return isActive ? "success" : "outline";
}

/**
 * Get the human-readable status text for a client's active state
 */
export function getClientStatusText(isActive: boolean): string {
  return isActive ? "Aktiv" : "Inaktiv";
}

/**
 * Badge variant for a rentencheck status. Returned variant feeds the Badge
 * component directly — see src/components/ui/badge.tsx.
 */
export function getRentencheckStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "completed":
      return "success";
    case "draft":
      return "warning";
    case "archived":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Get the human-readable text for a rentencheck status
 */
export function getRentencheckStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "Abgeschlossen";
    case "draft":
      return "Entwurf";
    case "archived":
      return "Archiviert";
    default:
      return "Unbekannt";
  }
}

/**
 * Format a date string to German locale format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE");
}

/**
 * Format a datetime string to German locale format with time
 */
export function formatDatetime(dateString: string): string {
  return new Date(dateString).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
