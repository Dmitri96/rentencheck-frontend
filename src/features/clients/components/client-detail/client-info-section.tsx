"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Plus, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/types";
import { getClientStatusVariant, getClientStatusText, formatDate } from "@/lib/utils/client-utils";
import { RentencheckService } from "@/lib/services/rentencheck-service";

interface ClientInfoSectionProps {
  client: Client;
  clientId: string;
}

export function ClientInfoSection({ client, clientId }: ClientInfoSectionProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateNewRentencheck = async () => {
    try {
      setCreating(true);
      const response = await RentencheckService.createRentencheck(parseInt(clientId), {
        title: `Neuer Rentencheck für ${client.full_name}`,
      });
      router.push(`/dashboard/clients/${clientId}/rentencheck/${response.rentencheck.id}`);
    } catch (error: unknown) {
      console.error("Error creating rentencheck:", error);
      toast.error("Fehler beim Erstellen des Rentenchecks");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-md border border-border bg-surface flex items-center justify-center">
          <User className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h2>{client.full_name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={getClientStatusVariant(client.is_active)}>
              {getClientStatusText(client.is_active)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Mandant seit {formatDate(client.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Button variant="outline">
          <Edit3 className="h-4 w-4" />
          Bearbeiten
        </Button>
        <Button onClick={handleCreateNewRentencheck} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {creating ? "Erstelle…" : "Neuer Rentencheck"}
        </Button>
      </div>
    </div>
  );
}
