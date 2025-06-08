import AdvisorManagement from '../../../../../components/dashboard/admin/advisor-management'
import RoleGuard from '../../../../../components/auth/role-guard'

export default function AdvisorManagementPage() {
  return (
    <RoleGuard roles={['admin']}>
      <AdvisorManagement />
    </RoleGuard>
  )
}

export const metadata = {
  title: 'Berater-Verwaltung - RENTENBLICK.de',
  description: 'Verwalten Sie Ihre Finanzberater und deren Berechtigungen',
} 