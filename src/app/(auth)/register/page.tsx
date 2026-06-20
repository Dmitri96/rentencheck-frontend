import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function RegisterPage() {
  return (
    <AuthLayout subtitle="Registrierung für Finanzberater">
      <RegisterForm />
    </AuthLayout>
  );
}
