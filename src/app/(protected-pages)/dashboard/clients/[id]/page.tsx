import { ClientDetailView } from "@/features/clients/components/client-detail-view";

// Next.js 15 made dynamic route `params` a Promise. Resolve it server-side
// before handing the typed id to the client component.
interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}
