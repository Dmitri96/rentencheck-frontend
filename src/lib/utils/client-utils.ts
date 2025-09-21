/**
 * Client-related utility functions
 * Shared helper functions for client data formatting and status handling
 */

/**
 * Get the appropriate status color class for a client's active state
 */
export function getClientStatusColor(isActive: boolean): string {
  return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
}

/**
 * Get the human-readable status text for a client's active state
 */
export function getClientStatusText(isActive: boolean): string {
  return isActive ? "Aktiv" : "Inaktiv";
}

/**
 * Get the appropriate color class for a rentencheck status
 */
export function getRentencheckStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
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
