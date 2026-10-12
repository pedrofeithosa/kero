import { Clock } from "lucide-react";
import { formatPrice } from "@/components/ui/price-tag";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import { lineTotal } from "@/features/cart/CartProvider";

/** Kero Mais — Resumo lateral do pedido (tempo real) */
export function OrderSummaryCard() {
  const { items, summary, appliedCoupon, deliveryType } = useCheckout();

  return (
    <aside
      aria-label="Resumo do pedido"
      className="space-y-4 rounded-card border border-border bg-card p-5 shadow-soft lg:sticky lg:top-24"
    >
      <h2 className="font-display text-h5 font-extrabold">Resumo do pedido</h2>

      <ul className="max-h-64 space-y-2 overflow-y-auto text-small">
        {items.map((item) => (
          <li key={item.lineId} className="flex justify-between gap-3">
            <span className="min-w-0 truncate text-muted-foreground">
              {item.quantity}× {item.name}
            </span>
            <span className="font-semibold">{formatPrice(lineTotal(item))}</span>
          </li>
        ))}
      </ul>

      <PriceSummary
        subtotal={summary.subtotal}
        deliveryFee={summary.deliveryFee}
        discount={summary.discount}
        total={summary.total}
        couponCode={appliedCoupon?.code ?? null}
        className="border-t border-border pt-4"
      />

      <p className="flex items-center gap-2 text-caption text-muted-foreground">
        <Clock className="size-4" aria-hidden="true" />
        {deliveryType === "delivery" ? "Entrega" : "Retirada"} em aprox. {summary.etaMinutes} min
      </p>
      {summary.missingForFreeDelivery > 0 ? (
        <p className="rounded-xl bg-highlight/15 p-3 text-caption">
          Faltam {formatPrice(summary.missingForFreeDelivery)} para <strong>frete grátis</strong>.
        </p>
      ) : null}
    </aside>
  );
}
