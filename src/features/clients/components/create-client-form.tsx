"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientService } from "@/lib/services/client-service";
import { createClientSchema, type CreateClientFormInput } from "@/lib/validations/client";
import { DashboardShell } from "@/components/dashboard-shell";

const OPTIONAL = <span className="text-[var(--ink-tertiary)] font-normal">(optional)</span>;

export function CreateClientForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateClientFormInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      postal_code: "",
      birth_date: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateClientFormInput) => {
    setIsLoading(true);

    try {
      const clientData = {
        ...data,
        phone: data.phone || undefined,
        street: data.street || undefined,
        city: data.city || undefined,
        postal_code: data.postal_code || undefined,
        birth_date: data.birth_date || undefined,
        notes: data.notes || undefined,
      };

      const response = await ClientService.createClient(clientData);

      toast.success(response.message || "Mandant erfolgreich angelegt.");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Error creating client:", error);

      const apiError = error as {
        response?: {
          status?: number;
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      if (apiError.response?.status === 422 && apiError.response?.data?.errors) {
        const serverErrors = apiError.response.data.errors;
        Object.keys(serverErrors).forEach((field) => {
          const messages = serverErrors[field];
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(messages[0]);
          }
        });
      } else {
        toast.error(
          apiError.response?.data?.message ||
            "Ein Fehler ist beim Anlegen des Mandanten aufgetreten.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push("/dashboard");
  };

  return (
    <DashboardShell
      title="Mandant anlegen"
      subtitle="Bitte füllen Sie alle erforderlichen Felder aus."
      backHref="/dashboard"
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mandantendaten</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Vorname</Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    aria-invalid={errors.first_name ? "true" : "false"}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Nachname</Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    aria-invalid={errors.last_name ? "true" : "false"}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonnummer {OPTIONAL}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    aria-invalid={errors.phone ? "true" : "false"}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Straße {OPTIONAL}</Label>
                <Input
                  id="street"
                  {...register("street")}
                  aria-invalid={errors.street ? "true" : "false"}
                />
                {errors.street && (
                  <p className="text-sm text-destructive">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt {OPTIONAL}</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    aria-invalid={errors.city ? "true" : "false"}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">PLZ {OPTIONAL}</Label>
                  <Input
                    id="postal_code"
                    {...register("postal_code")}
                    maxLength={5}
                    aria-invalid={errors.postal_code ? "true" : "false"}
                  />
                  {errors.postal_code && (
                    <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Geburtsdatum {OPTIONAL}</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register("birth_date")}
                  aria-invalid={errors.birth_date ? "true" : "false"}
                />
                {errors.birth_date && (
                  <p className="text-sm text-destructive">{errors.birth_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notizen {OPTIONAL}</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Zusätzliche Informationen zum Mandanten…"
                  rows={4}
                  aria-invalid={errors.notes ? "true" : "false"}
                />
                {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
              </div>

              <div className="flex justify-between items-center pt-6 mt-2 border-t border-border-subtle">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                  <X className="h-4 w-4" />
                  Abbrechen
                </Button>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Mandant speichern
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
