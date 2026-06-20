"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientService } from "@/lib/services/client-service";
import { RentencheckService, type Rentencheck } from "@/lib/services/rentencheck-service";
import { useAuth } from "@/hooks/useAuth";
import type { Client } from "@/types";
import {
  ClientDetailHeader,
  ClientInfoSection,
  ClientContactCard,
  ClientStatsCard,
  RentenchecksCard,
  ClientLoadingState,
  ClientErrorState,
} from "./client-detail";

interface ClientDetailViewProps {
  clientId: string;
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [rentenchecks, setRentenchecks] = useState<Rentencheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentenchecksLoading, setRentenchecksLoading] = useState(true);

  useEffect(() => {
    loadClientData();
    loadRentenchecks();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const response = await ClientService.getClient(parseInt(clientId));
      setClient(response.client);
    } catch (error: any) {
      console.error("Error loading client:", error);
      toast.error("Fehler beim Laden der Mandantendaten");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadRentenchecks = async () => {
    try {
      setRentenchecksLoading(true);
      const response = await RentencheckService.getRentenchecks(parseInt(clientId));
      setRentenchecks(response.data);
    } catch (error: any) {
      console.error("Error loading rentenchecks:", error);
      // Don't show error toast for rentenchecks, just show empty state
      setRentenchecks([]);
    } finally {
      setRentenchecksLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  // Loading state
  if (loading) {
    return <ClientLoadingState />;
  }

  // Error state
  if (!client) {
    return <ClientErrorState />;
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ClientDetailHeader onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-8">
        <ClientInfoSection client={client} clientId={clientId} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ClientContactCard client={client} />
            <ClientStatsCard client={client} rentenchecks={rentenchecks} />
          </div>

          {/* Rentenchecks Main Content */}
          <div className="lg:col-span-2">
            <RentenchecksCard
              clientId={clientId}
              rentenchecks={rentenchecks}
              loading={rentenchecksLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
