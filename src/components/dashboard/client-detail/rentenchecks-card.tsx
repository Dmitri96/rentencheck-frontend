"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit3, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { RentencheckService } from "@/lib/services/rentencheck-service";
import {
  formatDate,
  getRentencheckStatusColor,
  getRentencheckStatusText,
} from "@/lib/utils/client-utils";

interface RentenchecksCardProps {
  clientId: string;
  rentenchecks: Rentencheck[];
  loading: boolean;
}

export function RentenchecksCard({
  clientId,
  rentenchecks,
  loading,
}: RentenchecksCardProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateFirstRentencheck = async () => {
    try {
      setCreating(true);
      
      // Create new rentencheck first
      const response = await RentencheckService.createRentencheck(parseInt(clientId), {
        title: `Erster Rentencheck`
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

  const handleDownloadPdf = async (rentencheckId: number) => {
    try {
      setCreating(true);
      await RentencheckService.downloadPdf(parseInt(clientId), rentencheckId);
      toast.success("PDF wird heruntergeladen...");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toast.error("Fehler beim Herunterladen des PDFs");
    } finally {
      setCreating(false);
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Noch keine Rentenchecks
      </h3>
      <p className="text-gray-600 mb-6">
        Erstellen Sie den ersten Rentencheck für diesen Mandanten.
      </p>
      <Button 
        onClick={handleCreateFirstRentencheck}
        disabled={creating}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {creating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        {creating ? "Erstelle..." : "Ersten Rentencheck erstellen"}
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Rentenchecks werden geladen...</p>
    </div>
  );

  const renderRentenchecksList = () => (
    <div className="space-y-4">
      {rentenchecks.map((check) => (
        <div
          key={check.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{check.title}</h4>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">
                  Erstellt: {formatDate(check.created_at)}
                </span>
                <Badge
                  className={`text-xs ${getRentencheckStatusColor(check.status)}`}
                >
                  {getRentencheckStatusText(check.status)}
                </Badge>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Fortschritt: </span>
                <span className="font-semibold text-blue-600">
                  {check.progress_percentage}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({check.completed_steps?.length || 0} von 5 Schritten)
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/dashboard/clients/${clientId}/rentencheck/${check.id}`}
              >
                <Button variant="outline" size="sm" title="Bearbeiten">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
              {check.status === 'completed' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  title="PDF herunterladen"
                  onClick={() => handleDownloadPdf(check.id)}
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Rentenchecks</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading
          ? renderLoadingState()
          : rentenchecks.length === 0
            ? renderEmptyState()
            : renderRentenchecksList()}
      </CardContent>
    </Card>
  );
}
