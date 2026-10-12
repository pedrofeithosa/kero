import type { ReactNode, ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectableCardProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  actions?: ReactNode;
  className?: string;
}

/**
 * Kero Mais — Card selecionável.
 * Base para Delivery Card, Payment Card e Address Card (mesma linguagem visual).
 */
export function SelectableCard({
  icon: Icon,
  title,
  description,
  meta,
  selected,
  onSelect,
  actions,
  className,
}: SelectableCardProps): ReactElement {
  const Comp = onSelect ? "button" : "div";
  return (
    <Comp
      {...(onSelect ? { type: "button" as const, onClick: onSelect, "aria-pressed": selected ?? false } : {})}
      className={cn(
        "flex w-full items-start gap-4 rounded-card border-2 bg-card p-4 text-left transition-all duration-200",
        onSelect && "cursor-pointer hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected ? "border-primary bg-primary/5 shadow-soft" : "border-border",
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-input",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display text-body font-bold">{title}</span>
        {description ? (
          <span className="mt-0.5 block text-small text-muted-foreground">{description}</span>
        ) : null}
        {meta ? <span className="mt-2 block text-small font-semibold">{meta}</span> : null}
      </span>
      {actions ? <span className="shrink-0">{actions}</span> : null}
      {selected && !actions ? (
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" />
        </span>
      ) : null}
    </Comp>
  );
}

export const DeliveryCard = SelectableCard;
export const PaymentCard = SelectableCard;
export const AddressCard = SelectableCard;
