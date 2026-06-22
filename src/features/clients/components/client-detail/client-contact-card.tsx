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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Kontaktinformationen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{client.email}</span>
        </div>

        {client.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{client.phone}</span>
          </div>
        )}

        {(client.street || client.city) && (
          <div className="flex items-start space-x-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="text-sm">
              {client.street && <div>{client.street}</div>}
              {(client.postal_code || client.city) && (
                <div>
                  {client.postal_code} {client.city}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            Geboren: {client.birth_date ? formatDate(client.birth_date) : "Nicht angegeben"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
