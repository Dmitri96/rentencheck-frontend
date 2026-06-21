export default function ClientsLoading() {
  return (
    <div className="p-6 space-y-3">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
