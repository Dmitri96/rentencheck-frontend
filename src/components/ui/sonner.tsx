"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

/*
 * Toaster — light theme only. Muted backgrounds with colored borders for status
 * (per the brief: "no bright-fill toasts"). The success/error/warning toasts
 * use the surface-subtle background with a colored left border instead.
 */
const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground " +
            "group-[.toaster]:border group-[.toaster]:border-border " +
            "group-[.toaster]:shadow-md group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[var(--success)]",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[var(--destructive)]",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[var(--warning)]",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[var(--primary)]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
