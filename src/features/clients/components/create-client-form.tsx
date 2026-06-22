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
import { ArrowLeft, Settings, LogOut, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientService } from "@/lib/services/client-service";
import { createClientSchema, type CreateClientFormInput } from "@/lib/validations/client";
import { useAuthContext } from "@/providers/auth-provider";

export function CreateClientForm() {
  const router = useRouter();
  const { logout } = useAuthContext();
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
      // Convert empty strings to undefined for optional fields
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

      toast.success(response.message || "Mandant erfolgreich angelegt!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Error creating client:", error);

      // Handle validation errors from the API response
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
            "Ein Fehler ist beim Anlegen des Mandanten aufgetreten",
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Zurück</span>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RENTENBLICK.de</h1>
                <p className="text-sm text-gray-600">Mandant anlegen</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                <Settings className="h-4 w-4" />
                Einstellungen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Mandant anlegen</h2>
            <p className="text-gray-600">Bitte füllen Sie alle erforderlichen Felder aus</p>
          </div>

          {/* Form Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-gray-900">Mandantendaten</CardTitle>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">
                      Vorname *
                    </Label>
                    <Input
                      id="first_name"
                      {...register("first_name")}
                      placeholder=""
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      aria-invalid={errors.first_name ? "true" : "false"}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700">
                      Nachname *
                    </Label>
                    <Input
                      id="last_name"
                      {...register("last_name")}
                      placeholder=""
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      aria-invalid={errors.last_name ? "true" : "false"}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      E-Mail-Adresse *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder=""
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Telefonnummer
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder=""
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      aria-invalid={errors.phone ? "true" : "false"}
                    />
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-3">
                  <Label htmlFor="street" className="text-sm font-semibold text-gray-700">
                    Straße
                  </Label>
                  <Input
                    id="street"
                    {...register("street")}
                    placeholder=""
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    aria-invalid={errors.street ? "true" : "false"}
                  />
                  {errors.street && <p className="text-sm text-red-600">{errors.street.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                      Stadt
                    </Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder=""
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      aria-invalid={errors.city ? "true" : "false"}
                    />
                    {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="postal_code" className="text-sm font-semibold text-gray-700">
                      PLZ
                    </Label>
                    <Input
                      id="postal_code"
                      {...register("postal_code")}
                      placeholder=""
                      maxLength={5}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      aria-invalid={errors.postal_code ? "true" : "false"}
                    />
                    {errors.postal_code && (
                      <p className="text-sm text-red-600">{errors.postal_code.message}</p>
                    )}
                  </div>
                </div>

                {/* Birth Date */}
                <div className="space-y-3">
                  <Label htmlFor="birth_date" className="text-sm font-semibold text-gray-700">
                    Geburtsdatum
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...register("birth_date")}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    aria-invalid={errors.birth_date ? "true" : "false"}
                  />
                  {errors.birth_date && (
                    <p className="text-sm text-red-600">{errors.birth_date.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Notizen
                  </Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Zusätzliche Informationen zum Mandanten..."
                    rows={4}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    aria-invalid={errors.notes ? "true" : "false"}
                  />
                  {errors.notes && <p className="text-sm text-red-600">{errors.notes.message}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 transition-all duration-200 hover:shadow-md"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                    Abbrechen
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
      </div>
    </div>
  );
}
