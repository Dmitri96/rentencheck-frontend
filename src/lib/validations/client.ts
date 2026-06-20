import { z } from "zod";
import type { ClientFormData } from "@/types";

export const createClientSchema = z.object({
  first_name: z
    .string()
    .min(2, "Der Vorname muss mindestens 2 Zeichen lang sein")
    .max(50, "Der Vorname darf maximal 50 Zeichen lang sein")
    .regex(
      /^[a-zA-ZäöüÄÖÜß\s-]+$/,
      "Der Vorname darf nur Buchstaben, Leerzeichen und Bindestriche enthalten",
    ),

  last_name: z
    .string()
    .min(2, "Der Nachname muss mindestens 2 Zeichen lang sein")
    .max(50, "Der Nachname darf maximal 50 Zeichen lang sein")
    .regex(
      /^[a-zA-ZäöüÄÖÜß\s-]+$/,
      "Der Nachname darf nur Buchstaben, Leerzeichen und Bindestriche enthalten",
    ),

  email: z
    .string()
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein")
    .max(255, "Die E-Mail-Adresse darf maximal 255 Zeichen lang sein"),

  phone: z
    .string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, "Bitte geben Sie eine gültige Telefonnummer ein")
    .max(20, "Die Telefonnummer darf maximal 20 Zeichen lang sein")
    .optional()
    .or(z.literal("")),

  street: z
    .string()
    .max(255, "Die Straße darf maximal 255 Zeichen lang sein")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .max(100, "Die Stadt darf maximal 100 Zeichen lang sein")
    .optional()
    .or(z.literal("")),

  postal_code: z
    .string()
    .regex(/^[0-9]{5}$/, "Bitte geben Sie eine gültige 5-stellige PLZ ein")
    .optional()
    .or(z.literal("")),

  birth_date: z
    .string()
    .refine((date) => {
      if (!date) return true; // Optional field
      const parsedDate = new Date(date);
      const today = new Date();
      const minDate = new Date("1900-01-01");
      return parsedDate < today && parsedDate > minDate;
    }, "Das Geburtsdatum muss zwischen 01.01.1900 und heute liegen")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(1000, "Die Notizen dürfen maximal 1000 Zeichen lang sein")
    .optional()
    .or(z.literal("")),
});

// Type inference from the schema - now matches ClientFormData exactly
export type CreateClientFormInput = z.infer<typeof createClientSchema>;

// Update schema is the same for now
export const updateClientSchema = createClientSchema;
export type UpdateClientFormInput = z.infer<typeof updateClientSchema>;
