import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Variação percentual em relação ao período anterior. */
  delta?: number | null;
  /** Quando false, exibe "Dados insuficientes para comparação." */
  hasComparison?: boolean;
  hint?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hasComparison = true,
  hint,
  loading,
}: StatCardProps) {
  const positive = (delta ?? 0) > 0;
  const neutral = !delta;
  const DeltaIcon = neutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-28" />
      ) : (
        <p className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</p>
      )}
      <div className="mt-2 text-xs">
        {hasComparison && delta !== undefined && delta !== null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              neutral ? "text-muted-foreground" : positive ? "text-success" : "text-destructive",
            )}
          >
            <DeltaIcon className="h-3.5 w-3.5" />
            {Math.abs(delta).toFixed(1)}% vs. período anterior
          </span>
        ) : (
          <span className="text-muted-foreground">
            {hint ?? "Dados insuficientes para comparação."}
          </span>
        )}
      </div>
    </div>
  );
}
