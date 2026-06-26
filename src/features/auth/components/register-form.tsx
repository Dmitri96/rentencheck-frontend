"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
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
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterSchema } from "@/lib/validations/auth";
import { useAuthContext } from "@/providers/auth-provider";

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
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handlePlanChange = (value: string) => setValue("plan", value);
  const handleCheckboxChange = (field: keyof RegisterSchema, checked: boolean) => {
    setValue(field, checked as RegisterSchema[typeof field]);
  };

  const plans = [
    { value: "free", label: "Gratis · 3 Mandanten, 6 Rentenchecks", price: "0 €" },
    { value: "basic", label: "Basic · 20 Mandanten, 40 Rentenchecks", price: "49 €/Monat" },
    { value: "premium", label: "Premium · 100 Mandanten, 200 Rentenchecks", price: "99 €/Monat" },
    { value: "vip", label: "VIP · unbegrenzt", price: "199 €/Monat" },
  ];

  return (
    <Card>
      <CardContent className="px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Vorname</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Max"
                aria-invalid={errors.first_name ? "true" : "false"}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nachname</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Mustermann"
                aria-invalid={errors.last_name ? "true" : "false"}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="ihre.email@beispiel.de"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefonnummer{" "}
                <span className="text-[var(--ink-tertiary)] font-normal">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+49 123 456789"
                aria-invalid={errors.phone ? "true" : "false"}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                Unternehmen{" "}
                <span className="text-[var(--ink-tertiary)] font-normal">(optional)</span>
              </Label>
              <Input
                id="company"
                {...register("company")}
                placeholder="Ihre Beratungsgesellschaft"
                aria-invalid={errors.company ? "true" : "false"}
              />
              {errors.company && (
                <p className="text-sm text-destructive mt-1">{errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Tarif auswählen</Label>
            <Select value={watchedValues.plan} onValueChange={handlePlanChange}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie Ihren Tarif" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.value} value={plan.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{plan.label}</span>
                      <span className="ml-4 text-muted-foreground currency">{plan.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.plan && <p className="text-sm text-destructive mt-1">{errors.plan.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Mindestens 8 Zeichen"
                  className="pr-11"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-[180ms]"
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("password_confirmation")}
                  placeholder="Passwort wiederholen"
                  className="pr-11"
                  aria-invalid={errors.password_confirmation ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={handleToggleConfirmPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-[180ms]"
                  aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept_terms"
                checked={watchedValues.accept_terms}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("accept_terms", checked as boolean)
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="accept_terms"
                className="text-sm text-muted-foreground cursor-pointer leading-relaxed font-normal"
              >
                Ich akzeptiere die{" "}
                <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                  Allgemeinen Geschäftsbedingungen
                </Link>
                .
              </Label>
            </div>
            {errors.accept_terms && (
              <p className="text-sm text-destructive">{errors.accept_terms.message}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept_privacy"
                checked={watchedValues.accept_privacy}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("accept_privacy", checked as boolean)
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="accept_privacy"
                className="text-sm text-muted-foreground cursor-pointer leading-relaxed font-normal"
              >
                Ich akzeptiere die{" "}
                <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                  Datenschutzerklärung
                </Link>
                .
              </Label>
            </div>
            {errors.accept_privacy && (
              <p className="text-sm text-destructive">{errors.accept_privacy.message}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="newsletter"
                checked={watchedValues.newsletter}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("newsletter", checked as boolean)
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="newsletter"
                className="text-sm text-muted-foreground cursor-pointer leading-relaxed font-normal"
              >
                Newsletter mit Updates und Tipps zur Rentenberatung erhalten.
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Account erstellen
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-center text-sm text-muted-foreground">
            Bereits registriert?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              Jetzt anmelden
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-md border border-border-subtle bg-[var(--surface-subtle)] p-4">
          <p className="label-uppercase text-center mb-3">Ihre Vorteile</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success shrink-0" />
              Professionelle PDF-Reports
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success shrink-0" />
              Mandantenverwaltung
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success shrink-0" />
              DSGVO-konforme Datenhaltung
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success shrink-0" />
              24/7 Support
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
