"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit3, Download, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PensionResultsTable } from "@/components/pension-results-table";
import { PensionChart } from "@/components/pension-chart";
import {
  RentencheckService,
  type Rentencheck,
} from "@/lib/services/rentencheck-service";

/**
 * Analysis Page Component
 *
 * Displays the comprehensive pension analysis results for a completed rentencheck.
 * Provides navigation options to edit the data or download the PDF report.
 */
export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const rentencheckId = parseInt(params.rentencheckId as string);

  const [rentencheck, setRentencheck] = useState<Rentencheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Load the rentencheck data
  useEffect(() => {
    const loadRentencheck = async () => {
      try {
        setLoading(true);
        const data = await RentencheckService.getRentencheck(
          parseInt(clientId),
          rentencheckId,
        );
        setRentencheck(data.rentencheck);
      } catch (error: any) {
        console.error("Error loading rentencheck:", error);
        toast.error("Fehler beim Laden der Rentencheck-Daten");
        router.push(`/dashboard/clients/${clientId}`);
      } finally {
        setLoading(false);
      }
    };

    if (clientId && rentencheckId) {
      loadRentencheck();
    }
  }, [clientId, rentencheckId, router]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await RentencheckService.downloadPdf(parseInt(clientId), rentencheckId);
      toast.success("PDF wird heruntergeladen...");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toast.error("Fehler beim Herunterladen des PDFs");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Analyse wird geladen...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rentencheck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Rentencheck nicht gefunden
            </h1>
            <p className="text-gray-600 mb-6">
              Der angeforderte Rentencheck konnte nicht geladen werden.
            </p>
            <Link href={`/dashboard/clients/${clientId}`}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Mandanten
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if the rentencheck is completed
  if (rentencheck.status !== "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Analyse nicht verfügbar
            </h1>
            <p className="text-gray-600 mb-6">
              Die Analyse ist nur für abgeschlossene Rentenchecks verfügbar.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/dashboard/clients/${clientId}/rentencheck/${rentencheckId}`}
              >
                <Button>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Rentencheck fortsetzen
                </Button>
              </Link>
              <Link href={`/dashboard/clients/${clientId}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zum Mandanten
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use the backend data directly - no transformation needed!
  const desiredPension = rentencheck.step_2_data?.pensionWishCurrentValue || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/clients/${clientId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zum Mandanten
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {rentencheck.title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    {rentencheck.status === "completed"
                      ? "Abgeschlossen"
                      : "In Bearbeitung"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Erstellt:{" "}
                    {new Date(rentencheck.created_at).toLocaleDateString(
                      "de-DE",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/clients/${clientId}/rentencheck/${rentencheckId}`}
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Daten bearbeiten
                </Button>
              </Link>

              <Button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Lädt...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    PDF herunterladen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/*/!* Analysis Results Table (single authoritative table) *!/*/}
        {/*<div className="mt-8">*/}
        {/*  <PensionResultsTable data={rentencheck} desiredPension={desiredPension} />*/}
        {/*</div>*/}

        {/* Pension Timeline Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Analysis Results Table (single authoritative table) */}
          <div className="mb-8">
            <PensionResultsTable
              data={rentencheck}
              desiredPension={desiredPension}
            />
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Rentenverlauf über die Zeit
            </h2>
            <p className="text-sm text-gray-600">
              Visualisierung Ihrer Rentenentwicklung mit Inflation und
              Versorgungslücke
            </p>
          </div>
          <PensionChart data={rentencheck} desiredPension={desiredPension} />
        </div>

        {/* Footer Actions */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={`/dashboard/clients/${clientId}/rentencheck/${rentencheckId}`}
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-3"
                >
                  <Edit3 className="h-4 w-4" />
                  Daten bearbeiten
                </Button>
              </Link>

              <Button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Lädt...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    PDF-Bericht herunterladen
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
