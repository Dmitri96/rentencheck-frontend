/**
 * Default loading skeleton for the dashboard while server components stream.
 * Sub-routes can provide a more specific loading.tsx if needed.
 */
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-96 bg-muted animate-pulse rounded" />
    </div>
  );
}
