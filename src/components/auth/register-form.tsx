"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, UserPlus, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterSchema } from "@/lib/validations/auth";
import { useAuthContext } from "@/providers/AuthProvider";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      plan: "",
      password: "",
      password_confirmation: "",
      accept_terms: false,
      accept_privacy: false,
      newsletter: false,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await registerUser(data);
      // Redirect to dashboard after successful registration
      router.push("/dashboard");
    } catch (error) {
      // Error handling is done in the useAuth hook
      console.error("Registration error:", error);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePlanChange = (value: string) => {
    setValue("plan", value);
  };

  const handleCheckboxChange = (field: keyof RegisterSchema, checked: boolean) => {
    setValue(field, checked as any);
  };

  const plans = [
    { value: "free", label: "Gratis - 3 Mandanten, 6 Rentenchecks", price: "0€" },
    { value: "basic", label: "Basic - 20 Mandanten, 40 Rentenchecks", price: "49€/Monat" },
    { value: "premium", label: "Premium - 100 Mandanten, 200 Rentenchecks", price: "99€/Monat" },
    { value: "vip", label: "VIP - Unbegrenzt", price: "199€/Monat" },
  ];

  return (
    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
          <UserPlus className="h-6 w-6 text-blue-600" />
          Registrierung
        </CardTitle>
        <p className="text-gray-600 text-center mt-2">Erstellen Sie Ihren Berater-Account</p>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">
                Vorname *
              </Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Max"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                aria-invalid={errors.first_name ? "true" : "false"}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700">
                Nachname *
              </Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Mustermann"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                aria-invalid={errors.last_name ? "true" : "false"}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              E-Mail-Adresse *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="ihre.email@beispiel.de"
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Telefonnummer
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+49 123 456789"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                aria-invalid={errors.phone ? "true" : "false"}
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
                Unternehmen
              </Label>
              <Input
                id="company"
                {...register("company")}
                placeholder="Ihre Beratungsgesellschaft"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                aria-invalid={errors.company ? "true" : "false"}
              />
              {errors.company && (
                <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
              )}
            </div>
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <Label htmlFor="plan" className="text-sm font-semibold text-gray-700">
              Tarif auswählen *
            </Label>
            <Select value={watchedValues.plan} onValueChange={handlePlanChange}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Wählen Sie Ihren Tarif" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.value} value={plan.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{plan.label}</span>
                      <span className="ml-4 font-semibold text-blue-600">{plan.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.plan && <p className="text-sm text-red-600 mt-1">{errors.plan.message}</p>}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Passwort *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Mindestens 8 Zeichen"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 pr-12"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="password_confirmation"
                className="text-sm font-semibold text-gray-700"
              >
                Passwort bestätigen *
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("password_confirmation")}
                  placeholder="Passwort wiederholen"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 pr-12"
                  aria-invalid={errors.password_confirmation ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={handleToggleConfirmPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-600 mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept_terms"
                checked={watchedValues.accept_terms}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("accept_terms", checked as boolean)
                }
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
              />
              <Label
                htmlFor="accept_terms"
                className="text-sm text-gray-600 cursor-pointer leading-relaxed"
              >
                Ich akzeptiere die{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                  Allgemeinen Geschäftsbedingungen
                </Link>{" "}
                *
              </Label>
            </div>
            {errors.accept_terms && (
              <p className="text-sm text-red-600 mt-1">{errors.accept_terms.message}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept_privacy"
                checked={watchedValues.accept_privacy}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("accept_privacy", checked as boolean)
                }
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
              />
              <Label
                htmlFor="accept_privacy"
                className="text-sm text-gray-600 cursor-pointer leading-relaxed"
              >
                Ich akzeptiere die{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Datenschutzerklärung
                </Link>{" "}
                *
              </Label>
            </div>
            {errors.accept_privacy && (
              <p className="text-sm text-red-600 mt-1">{errors.accept_privacy.message}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="newsletter"
                checked={watchedValues.newsletter}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("newsletter", checked as boolean)
                }
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
              />
              <Label
                htmlFor="newsletter"
                className="text-sm text-gray-600 cursor-pointer leading-relaxed"
              >
                Ich möchte den Newsletter mit Updates und Tipps zur Rentenberatung erhalten
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Account erstellen
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Bereits registriert?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Jetzt anmelden
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-3 text-center">Ihre Vorteile</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-blue-800">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Professionelle PDF-Reports
            </div>
            <div className="flex items-center text-blue-800">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Mandantenverwaltung
            </div>
            <div className="flex items-center text-blue-800">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              DSGVO-konforme Datenhaltung
            </div>
            <div className="flex items-center text-blue-800">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              24/7 Support
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
