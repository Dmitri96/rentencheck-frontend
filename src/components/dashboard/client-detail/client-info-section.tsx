"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Plus, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Client } from "@/types";
import { getClientStatusColor, getClientStatusText, formatDate } from "@/lib/utils/client-utils";
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

      // Create new rentencheck first
      const response = await RentencheckService.createRentencheck(parseInt(clientId), {
        title: `Neuer Rentencheck für ${client.full_name}`,
      });

      // Navigate to the specific rentencheck edit page
      router.push(`/dashboard/clients/${clientId}/rentencheck/${response.rentencheck.id}`);
    } catch (error: any) {
      console.error("Error creating rentencheck:", error);
      toast.error("Fehler beim Erstellen des Rentenchecks");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{client.full_name}</h2>
          <div className="flex items-center space-x-3 mt-1">
            <Badge className={`text-xs ${getClientStatusColor(client.is_active)}`}>
              {getClientStatusText(client.is_active)}
            </Badge>
            <span className="text-sm text-gray-500">
              Mandant seit {formatDate(client.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="outline" className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Bearbeiten
        </Button>
        <Button
          onClick={handleCreateNewRentencheck}
          disabled={creating}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {creating ? "Erstelle..." : "Neuer Rentencheck"}
        </Button>
      </div>
    </div>
  );
}
