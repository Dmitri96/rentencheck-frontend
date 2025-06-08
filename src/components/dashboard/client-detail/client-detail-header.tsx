"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface ClientDetailHeaderProps {
  onLogout: () => void
}

export function ClientDetailHeader({ onLogout }: ClientDetailHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück</span>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RENTENBLICK.de</h1>
              <p className="text-sm text-gray-600">Mandantendetails</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
              <Settings className="h-4 w-4" />
              Einstellungen
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 text-red-600"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 