import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-Mail-Adresse ist erforderlich' })
    .email({ message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' }),
  password: z
    .string()
    .min(1, { message: 'Passwort ist erforderlich' })
    .min(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein' }),
  remember_me: z.boolean().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, { message: 'Vorname ist erforderlich' })
    .max(50, { message: 'Vorname darf maximal 50 Zeichen lang sein' }),
  last_name: z
    .string()
    .min(1, { message: 'Nachname ist erforderlich' })
    .max(50, { message: 'Nachname darf maximal 50 Zeichen lang sein' }),
  email: z
    .string()
    .min(1, { message: 'E-Mail-Adresse ist erforderlich' })
    .email({ message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\+]?[0-9\s\-\(\)]+$/.test(val), {
      message: 'Bitte geben Sie eine gültige Telefonnummer ein',
    }),
  company: z
    .string()
    .max(100, { message: 'Unternehmensname darf maximal 100 Zeichen lang sein' })
    .optional(),
  plan: z
    .string()
    .min(1, { message: 'Bitte wählen Sie einen Tarif aus' }),
  password: z
    .string()
    .min(1, { message: 'Passwort ist erforderlich' })
    .min(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten',
    }),
  password_confirmation: z
    .string()
    .min(1, { message: 'Passwort-Bestätigung ist erforderlich' }),
  accept_terms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren',
    }),
  accept_privacy: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Sie müssen die Datenschutzerklärung akzeptieren',
    }),
  newsletter: z.boolean().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwörter stimmen nicht überein',
  path: ['password_confirmation'],
});

export type RegisterSchema = z.infer<typeof registerSchema>; 