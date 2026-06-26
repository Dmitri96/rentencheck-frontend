"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, Phone, MapPin } from "lucide-react";
import type { Client } from "@/types";
import { formatDate } from "@/lib/utils/client-utils";

interface ClientContactCardProps {
  client: Client;
}

export function ClientContactCard({ client }: ClientContactCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontaktinformationen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-[var(--ink-tertiary)] shrink-0" />
          <span className="text-sm text-foreground truncate">{client.email}</span>
        </div>

        {client.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-[var(--ink-tertiary)] shrink-0" />
            <span className="text-sm text-foreground">{client.phone}</span>
          </div>
        )}

        {(client.street || client.city) && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-[var(--ink-tertiary)] shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              {client.street && <div>{client.street}</div>}
              {(client.postal_code || client.city) && (
                <div>
                  {client.postal_code} {client.city}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-[var(--ink-tertiary)] shrink-0" />
          <span className="text-sm text-muted-foreground">
            Geboren:{" "}
            <span className="text-foreground">
              {client.birth_date ? formatDate(client.birth_date) : "Nicht angegeben"}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
