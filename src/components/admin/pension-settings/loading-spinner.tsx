import React from 'react'

/**
 * Lade-Spinner-Komponente
 * 
 * Zeigt einen Spinner mit einer optionalen Nachricht während des Ladens an.
 */
interface LoadingSpinnerProps {
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Laden..." 
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
} 