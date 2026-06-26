import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Input — 40px height, 6px radius, soft navy focus halo.
 * Matches Button's `default` size so they align in forms.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base
        "flex h-10 w-full min-w-0 rounded-md border border-input bg-surface px-3 py-2 " +
          "text-[0.9375rem] text-foreground placeholder:text-muted-foreground " +
          "shadow-xs transition-colors duration-[180ms] outline-none",
        // file input slot
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // focus — navy halo, no jarring border swap
        "focus-visible:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring/40",
        // selection — slate tint
        "selection:bg-primary/15 selection:text-foreground",
        // invalid
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
