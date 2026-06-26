import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Centered auth card on warm-ivory background.
 * Serif monogram + Fraunces wordmark; no gradient hero strip.
 */
export function AuthLayout({ children, title = "Rentenblick", subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md border border-border bg-surface mb-5">
            <span
              className="text-[1.5rem] leading-none text-foreground"
              style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 500 }}
            >
              R
            </span>
          </div>
          <h1 className="text-[1.75rem] leading-tight text-center">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-[0.9375rem] text-muted-foreground text-center">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
