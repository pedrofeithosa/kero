import { Check, ChefHat, Clock, PackageCheck, Bike, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { OrderStatusId } from "@/features/checkout/types";

export type OrderStatus = OrderStatusId;

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; icon: LucideIcon; variant: "muted" | "info" | "warning" | "success" | "destructive" }
> = {
  received: { label: "Recebido", icon: Clock, variant: "muted" },
  accepted: { label: "Aceito", icon: Check, variant: "info" },
  preparing: { label: "Em preparo", icon: ChefHat, variant: "warning" },
  ready: { label: "Pronto", icon: PackageCheck, variant: "info" },
  out_for_delivery: { label: "Saiu para entrega", icon: Bike, variant: "warning" },
  delivered: { label: "Entregue", icon: Check, variant: "success" },
  cancelled: { label: "Cancelado", icon: XCircle, variant: "destructive" },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { label, icon: Icon, variant } = ORDER_STATUS[status];
  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden="true" /> {label}
    </Badge>
  );
}

export interface TimelineStep {
  status: OrderStatus;
  time?: string;
  done?: boolean;
  current?: boolean;
}

/** Kero Mais — Order Timeline */
export function OrderTimeline({ steps, className }: { steps: TimelineStep[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-6 border-l-2 border-border pl-6", className)}>
      {steps.map((step) => {
        const { label, icon: Icon } = ORDER_STATUS[step.status];
        const state = step.current ? "current" : step.done ? "done" : "todo";
        return (
          <li key={step.status} className="relative">
            <span
              className={cn(
                "absolute -left-[2.05rem] grid size-8 place-items-center rounded-full border-2",
                state === "done" && "border-success bg-success text-success-foreground",
                state === "current" && "border-primary bg-primary text-primary-foreground",
                state === "todo" && "border-border bg-background text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <p
              className={cn(
                "font-display font-bold",
                state === "todo" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {label}
            </p>
            {step.time ? <p className="text-small text-muted-foreground">{step.time}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
