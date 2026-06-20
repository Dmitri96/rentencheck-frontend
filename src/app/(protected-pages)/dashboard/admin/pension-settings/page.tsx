import { PensionSettingsPanel } from "../../../../../components/admin/pension-settings-panel";
import RoleGuard from "../../../../../components/auth/role-guard";

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
