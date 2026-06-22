import AdvisorManagement from "@/features/admin/components/advisor-management";
import RoleGuard from "@/features/auth/components/role-guard";

export default function AdvisorManagementPage() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdvisorManagement />
    </RoleGuard>
  );
}

export const metadata = {
  title: "Berater-Verwaltung - RENTENBLICK.de",
  description: "Verwalten Sie Ihre Finanzberater und deren Berechtigungen",
};
