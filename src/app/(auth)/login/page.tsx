import { LoginForm } from "@/features/auth/components/login-form";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout subtitle="Anmeldung für Finanzberater">
      <LoginForm />
    </AuthLayout>
  );
}
