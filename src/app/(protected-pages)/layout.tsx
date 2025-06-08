'use client';

import ErrorBoundary from '@/components/ui/error-boundary';
import Navigation from '@/components/dashboard/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // During server rendering or initial mounting, show a minimal skeleton loader
  // This prevents hydration errors by ensuring we don't have different outputs on server vs client
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <Skeleton className="h-20 w-full mb-6 rounded-lg" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-[200px] w-full mb-6 rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // We'll return null here since we're redirecting in the useEffect
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
} 