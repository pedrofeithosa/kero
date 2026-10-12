import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
  label?: string;
}

/** Kero Mais — Quantity Selector */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  size = "default",
  className,
  label = "Quantidade",
}: QuantitySelectorProps) {
  const btn = cn(
    "inline-flex items-center justify-center rounded-full text-foreground transition-colors hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-10 w-10",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-button border border-border bg-muted p-1",
        className,
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "min-w-8 text-center font-display font-bold tabular-nums",
          size === "sm" ? "text-small" : "text-body",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
