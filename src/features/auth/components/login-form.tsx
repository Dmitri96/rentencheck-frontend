"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth";
import { useAuthContext } from "@/providers/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const rememberMe = watch("remember_me");

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleRememberMeChange = (checked: boolean) => setValue("remember_me", checked);

  return (
    <Card>
      <CardContent className="px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Ihr Passwort"
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
              />
              <Label htmlFor="rememberMe" className="cursor-pointer text-muted-foreground">
                Angemeldet bleiben
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
            >
              Passwort vergessen?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Anmelden
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-center text-sm text-muted-foreground">
            Noch kein Account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
