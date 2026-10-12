import { formatPrice } from "@/components/ui/price-tag";
import { cn } from "@/lib/utils";

interface PriceSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  className?: string;
}

/** Kero Mais — Resumo de valores do pedido */
export function PriceSummary({
  subtotal,
  deliveryFee,
  discount,
  total,
  couponCode,
  className,
}: PriceSummaryProps) {
  return (
    <dl className={cn("space-y-2 text-small", className)}>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-semibold">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Taxa de entrega</dt>
        <dd className={cn("font-semibold", deliveryFee === 0 && "text-success")}>
          {deliveryFee === 0 ? "Grátis" : formatPrice(deliveryFee)}
        </dd>
      </div>
      {discount > 0 ? (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Desconto {couponCode ? `(${couponCode})` : null}
          </dt>
          <dd className="font-semibold text-success">- {formatPrice(discount)}</dd>
        </div>
      ) : null}
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <dt className="font-display text-h6 font-bold">Total</dt>
        <dd className="font-display text-h5 font-extrabold text-primary">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
