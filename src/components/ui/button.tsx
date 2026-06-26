import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Button — trust-first financial register.
 *
 * Design rules (see docs/design-brief.md):
 *  - Color shift on hover only — no transform / lift. Lifting buttons reads as toy.
 *  - Radius `md` (6px) — disciplined, not consumer-app-rounded.
 *  - Focus ring uses the navy halo token (`ring-ring/40`) — not a default browser blue.
 *  - Heights: 40 / 36 / 44 — match the input scale so they line up in forms.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium tracking-[-0.005em] " +
    "transition-colors duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 " +
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-offset-0 " +
    "aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Solid navy ink — the canonical primary CTA.
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        // Terracotta destructive — confirmation flows only, not for everyday delete.
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        // Outline — secondary action next to a primary in dialogs / forms.
        outline:
          "border border-border bg-surface text-foreground hover:bg-accent hover:text-accent-foreground",
        // Secondary fill — quiet companion (e.g. "Edit" near a primary "Save").
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        // Ghost — toolbar / dense table actions.
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        // Link — inline navigation; underline-on-hover for affordance.
        link: "text-primary underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        // Default 40px height matches the input scale so they line up in forms.
        default: "h-10 px-4 text-[0.9375rem]",
        sm: "h-9 px-3 text-sm gap-1.5",
        lg: "h-11 px-6 text-[0.9375rem]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
