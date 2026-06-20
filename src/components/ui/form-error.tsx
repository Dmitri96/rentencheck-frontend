"use client";

import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

interface FormErrorProps {
  message?: string;
  id?: string;
}

export function FormError({ message, id }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="text-sm text-red-500 flex items-center gap-1 mt-1" id={id} aria-live="polite">
      <ExclamationCircleIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}
