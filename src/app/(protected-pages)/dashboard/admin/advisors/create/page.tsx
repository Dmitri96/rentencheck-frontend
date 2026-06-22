import CreateAdvisorForm from "@/features/admin/components/create-advisor-form";
import RoleGuard from "@/features/auth/components/role-guard";

export default function CreateAdvisorPage() {
  return (
    <RoleGuard roles={["admin"]}>
      <CreateAdvisorForm />
    </RoleGuard>
  );
}

export const metadata = {
  title: "Neuen Berater erstellen - RENTENBLICK.de",
  description: "Erstellen Sie einen neuen Finanzberater-Account",
};
