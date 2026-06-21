export default function AdminLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-56 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
