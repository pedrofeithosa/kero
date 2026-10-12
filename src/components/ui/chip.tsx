import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Kero Mais — Chip (filtros de categoria, tags selecionáveis) */
const chipVariants = cva(
  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-small font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      active: {
        true: "border-primary bg-primary text-primary-foreground shadow-brand",
        false: "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: { active: false },
  },
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={active ?? false}
      className={cn(chipVariants({ active }), className)}
      {...props}
    />
  ),
);
Chip.displayName = "Chip";
