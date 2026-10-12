import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

interface PriceTagProps {
  price: number;
  compareAt?: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}

/** Kero Mais — Price Tag */
export function PriceTag({ price, compareAt, size = "default", className }: PriceTagProps) {
  const sizes = {
    sm: "text-small",
    default: "text-h5",
    lg: "text-h4",
  } as const;
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-display font-extrabold text-foreground", sizes[size])}>
        {formatPrice(price)}
      </span>
      {compareAt && compareAt > price ? (
        <span className="text-small text-muted-foreground line-through">
          {formatPrice(compareAt)}
        </span>
      ) : null}
    </div>
  );
}

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}

/** Kero Mais — Rating Stars */
export function RatingStars({ value, count, size = 16, className }: RatingStarsProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`Avaliação ${value.toFixed(1)} de 5`}
    >
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              i <= Math.round(value) ? "fill-highlight text-highlight" : "text-border",
            )}
          />
        ))}
      </div>
      <span className="text-caption font-semibold text-muted-foreground">
        {value.toFixed(1)}
        {count != null ? ` (${count})` : ""}
      </span>
    </div>
  );
}
