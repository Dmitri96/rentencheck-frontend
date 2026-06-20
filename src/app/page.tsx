import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Calculator,
  FileText,
  Users,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RENTENBLICK.de</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="px-6">
                  Anmelden
                </Button>
              </Link>
              <Link href="/register">
                <Button className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Registrieren
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-8 shadow-xl">
            <span className="text-3xl text-white font-bold">R</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            RENTENBLICK.de
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Die professionelle Lösung für Rentenberater. Erstellen Sie detaillierte Rentenchecks,
            verwalten Sie Ihre Mandanten und optimieren Sie Ihre Beratungsqualität.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register">
              <Button
                size="lg"
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-200"
              >
                Kostenlos starten
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-2 hover:bg-gray-50"
              >
                Bereits registriert? Anmelden
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              PDF-Export
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
              Mandantenverwaltung
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
              Professionelle Berichte
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Alles was Sie für die Rentenberatung brauchen
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Moderne Tools für professionelle Rentenberater
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Rentencheck-Rechner</h3>
                <p className="text-gray-600">
                  Präzise Berechnungen der Rentenlücke und individueller Vorsorgebedarf für jeden
                  Mandanten.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF-Berichte</h3>
                <p className="text-gray-600">
                  Professionelle, gebrandete PDF-Berichte für Ihre Mandanten mit allen wichtigen
                  Kennzahlen.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Mandantenverwaltung</h3>
                <p className="text-gray-600">
                  Zentrale Verwaltung aller Mandanten mit Verlaufsdokumentation und
                  Terminerinnerungen.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Trend-Analysen</h3>
                <p className="text-gray-600">
                  Übersichtliche Dashboards und Auswertungen für bessere Beratungsentscheidungen.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Datenschutz</h3>
                <p className="text-gray-600">
                  DSGVO-konforme Datenhaltung und höchste Sicherheitsstandards für sensible
                  Mandantendaten.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Zeitersparnis</h3>
                <p className="text-gray-600">
                  Automatisierte Berechnungen und vorgefertigte Templates sparen wertvolle
                  Beratungszeit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Bereit für professionelle Rentenberatung?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Starten Sie noch heute und erstellen Sie Ihren ersten Rentencheck. Kostenlose
                Registrierung ohne Vertragsbindung.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-50 shadow-lg"
                  >
                    Jetzt kostenlos registrieren
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white/10"
                  >
                    Anmelden
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-bold">RENTENBLICK.de</span>
            </div>
            <div className="text-center text-gray-400">
              <p className="mb-4">
                © 2024 RENTENBLICK.de - Professionelle Rentenberatungssoftware
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <Link href="#" className="hover:text-white transition-colors">
                  Datenschutz
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Impressum
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  AGB
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Kontakt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
