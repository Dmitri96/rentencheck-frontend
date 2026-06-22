"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminService } from "@/lib/services/admin-service";
import { CreateAdvisorInput } from "@/types/auth";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const CreateAdvisorForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<CreateAdvisorInput>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    password_confirmation: "",
  });

  const handleInputChange = (field: keyof CreateAdvisorInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: [],
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = ["Der Vorname ist erforderlich."];
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = ["Der Nachname ist erforderlich."];
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = ["Die E-Mail-Adresse ist erforderlich."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ["Bitte geben Sie eine gültige E-Mail-Adresse ein."];
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = ["Das Passwort ist erforderlich."];
    } else if (formData.password.length < 8) {
      newErrors.password = ["Das Passwort muss mindestens 8 Zeichen haben."];
    }

    // Password confirmation validation
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = ["Die Passwort-Bestätigung ist erforderlich."];
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = ["Die Passwort-Bestätigung stimmt nicht überein."];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const result = await AdminService.createAdvisor(formData);

      toast.success(result.message || "Berater wurde erfolgreich erstellt");
      router.push("/dashboard/admin/advisors");
    } catch (error: unknown) {
      console.error("Error creating advisor:", error);

      const apiError = error as { errors?: Record<string, string[]>; message?: string };
      if (apiError.errors) {
        setErrors(apiError.errors);
      }

      toast.error(apiError.message || "Fehler beim Erstellen des Beraters");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/advisors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Neuen Berater erstellen</h1>
          <p className="text-gray-600 mt-2">Erstellen Sie einen neuen Finanzberater-Account</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Berater-Informationen</CardTitle>
          <CardDescription>Geben Sie die Daten für den neuen Finanzberater ein</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  Vorname <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  placeholder="Max"
                  className={getFieldError("first_name") ? "border-red-500" : ""}
                />
                {getFieldError("first_name") && (
                  <p className="text-sm text-red-600">{getFieldError("first_name")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Nachname <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  placeholder="Mustermann"
                  className={getFieldError("last_name") ? "border-red-500" : ""}
                />
                {getFieldError("last_name") && (
                  <p className="text-sm text-red-600">{getFieldError("last_name")}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                E-Mail-Adresse <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="max.mustermann@example.com"
                className={getFieldError("email") ? "border-red-500" : ""}
              />
              {getFieldError("email") && (
                <p className="text-sm text-red-600">{getFieldError("email")}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+49 123 456789"
                className={getFieldError("phone") ? "border-red-500" : ""}
              />
              {getFieldError("phone") && (
                <p className="text-sm text-red-600">{getFieldError("phone")}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Unternehmen</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Musterberatung GmbH"
                className={getFieldError("company") ? "border-red-500" : ""}
              />
              {getFieldError("company") && (
                <p className="text-sm text-red-600">{getFieldError("company")}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Passwort <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Mindestens 8 Zeichen"
                    className={getFieldError("password") ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {getFieldError("password") && (
                  <p className="text-sm text-red-600">{getFieldError("password")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  Passwort bestätigen <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                    placeholder="Passwort wiederholen"
                    className={
                      getFieldError("password_confirmation") ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {getFieldError("password_confirmation") && (
                  <p className="text-sm text-red-600">{getFieldError("password_confirmation")}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <div className="flex gap-3">
                <Link href="/dashboard/admin/advisors">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Abbrechen
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Berater erstellen
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdvisorForm;
