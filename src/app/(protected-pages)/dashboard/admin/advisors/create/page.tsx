import CreateAdvisorForm from '../../../../../../components/dashboard/admin/create-advisor-form'
import RoleGuard from '../../../../../../components/auth/role-guard'

export default function CreateAdvisorPage() {
  return (
    <RoleGuard roles={['admin']}>
      <CreateAdvisorForm />
    </RoleGuard>
  )
}

export const metadata = {
  title: 'Neuen Berater erstellen - RENTENBLICK.de',
  description: 'Erstellen Sie einen neuen Finanzberater-Account',
} 