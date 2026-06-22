import AdminDashboard from "@/features/admin/components/admin-dashboard";
import RoleGuard from "@/features/auth/components/role-guard";

export default function AdminDashboardPage() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminDashboard />
    </RoleGuard>
  );
}

export const metadata = {
  title: "Admin Dashboard - RENTENBLICK.de",
  description: "Administrativer Überblick über das RENTENBLICK.de System",
};
