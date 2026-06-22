"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
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
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (error) {
      // Error handling is done in the useAuth hook
      console.error("Login error:", error);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (checked: boolean) => {
    setValue("remember_me", checked);
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
          <LogIn className="h-6 w-6 text-blue-600" />
          Anmeldung
        </CardTitle>
        <p className="text-gray-600 text-center mt-2">
          Melden Sie sich in Ihrem Berater-Account an
        </p>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Passwort *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Ihr Passwort"
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                Angemeldet bleiben
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Passwort vergessen?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Anmelden
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Noch kein Account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Jetzt registrieren
            </Link>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            SSL-verschlüsselt
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            DSGVO-konform
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            24/7 Support
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
