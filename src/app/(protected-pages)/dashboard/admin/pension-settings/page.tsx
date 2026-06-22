import { PensionSettingsPanel } from "@/features/admin/components/pension-settings-panel";
import RoleGuard from "@/features/auth/components/role-guard";

export default function PensionSettingsPage() {
  return (
    <RoleGuard roles={["admin"]}>
      <PensionSettingsPanel />
    </RoleGuard>
  );
}

export const metadata = {
  title: "Pensionsparameter - RENTENBLICK.de",
  description: "Verwalten Sie die Parameter für deutsche Rentenberechnungen",
};
