"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

/*
 * Label — field label register.
 * Sentence case, body-sm size, ink-secondary color per the brief.
 * Pair with `(optional)` not `*` for optional/required signalling.
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-[0.8125rem] font-medium leading-none text-foreground select-none " +
          "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 " +
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
