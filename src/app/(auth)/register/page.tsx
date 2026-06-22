import { RegisterForm } from "@/features/auth/components/register-form";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export default function RegisterPage() {
  return (
    <AuthLayout subtitle="Registrierung für Finanzberater">
      <RegisterForm />
    </AuthLayout>
  );
}
