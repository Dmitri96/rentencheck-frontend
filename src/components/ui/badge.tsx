import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Badge — status pills + small contextual labels.
 *
 * Variants are tint-on-tint: a soft background (e.g. positive-bg) with a
 * matching foreground (e.g. positive). No solid fills except `default`
 * (navy) and `destructive` — those are for high-emphasis states only.
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border px-2 py-0.5 " +
    "text-[0.6875rem] font-medium uppercase tracking-[0.06em] " +
    "w-fit whitespace-nowrap shrink-0 gap-1 " +
    "[&>svg]:size-3 [&>svg]:pointer-events-none " +
    "focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none " +
    "transition-colors duration-[180ms]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        // Soft tints — primary use case for status pills
        success:
          "border-transparent bg-[color-mix(in_oklch,var(--success)_10%,var(--background))] text-success",
        warning:
          "border-transparent bg-[color-mix(in_oklch,var(--warning)_15%,var(--background))] text-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))]",
        destructive:
          "border-transparent bg-[color-mix(in_oklch,var(--destructive)_10%,var(--background))] text-destructive",
        outline: "border-border text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
