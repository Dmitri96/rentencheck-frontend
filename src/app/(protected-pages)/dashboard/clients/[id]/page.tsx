import { ClientDetailView } from "@/components/dashboard/client-detail-view"

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  return <ClientDetailView clientId={params.id} />
}
