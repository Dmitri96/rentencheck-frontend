import AdminDashboard from '../../../../components/dashboard/admin/admin-dashboard'
import RoleGuard from '../../../../components/auth/role-guard'

export default function AdminDashboardPage() {
  return (
    <RoleGuard roles={['admin']}>
      <AdminDashboard />
    </RoleGuard>
  )
}

export const metadata = {
  title: 'Admin Dashboard - RENTENBLICK.de',
  description: 'Administrativer Überblick über das RENTENBLICK.de System',
} 