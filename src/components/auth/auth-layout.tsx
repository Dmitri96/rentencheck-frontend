import { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

/**
 * Shared layout component for authentication pages
 * Provides consistent styling and branding across login/register pages
 */
export function AuthLayout({ children, title = "RENTENBLICK.de", subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-2xl text-white font-bold">R</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
} 