import { Clock, MapPin, Wallet, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/price-tag";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import { lineUnitPrice, lineTotal } from "@/features/cart/CartProvider";
import { PAYMENT_METHOD_LABEL } from "@/features/checkout/types";
import { ADDRESS_LINE } from "@/lib/business";

/** Kero Mais — Etapa 4: revisão e confirmação final */
export function ReviewStep() {
  const {
    items,
    summary,
    deliveryType,
    address,
    customer,
    payment,
    appliedCoupon,
    submit,
    isSubmitting,
    canSubmit,
    blockingReason,
    back,
    goTo,
  } = useCheckout();

  return (
    <section aria-labelledby="revisao-title" className="space-y-6">
      <header className="space-y-1">
        <h2 id="revisao-title" className="font-display text-h4 font-extrabold">
          Confira e confirme
        </h2>
        <p className="text-small text-muted-foreground">Revise tudo antes de enviarmos para a cozinha.</p>
      </header>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.lineId} className="flex gap-3 rounded-card border border-border p-3">
            <img src={item.image} alt={item.name} loading="lazy" className="size-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold">
                {item.quantity}× {item.name}
              </p>
              {item.options.length > 0 ? (
                <p className="text-caption text-muted-foreground">
                  {item.options.map((o) => o.name).join(" · ")}
                </p>
              ) : null}
              {item.notes ? <p className="text-caption text-muted-foreground">Obs.: {item.notes}</p> : null}
              <p className="text-caption text-muted-foreground">Unitário {formatPrice(lineUnitPrice(item))}</p>
            </div>
            <p className="font-display font-bold">{formatPrice(lineTotal(item))}</p>
          </li>
        ))}
      </ul>

      <dl className="space-y-3 rounded-card border border-border p-4 text-small">
        <div className="flex items-start justify-between gap-3">
          <div>
            <dt className="flex items-center gap-2 font-display font-bold">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {deliveryType === "delivery" ? "Entrega" : "Retirada no balcão"}
            </dt>
            <dd className="text-muted-foreground">
              {deliveryType === "delivery" && address
                ? `${address.street}, ${address.number}${address.complement ? ` — ${address.complement}` : ""} · ${address.district}, ${address.city}/${address.state}`
                : ADDRESS_LINE}
            </dd>
            <dd className="text-muted-foreground">
              {customer?.name} · {customer?.phone}
            </dd>
          </div>
          <Button variant="ghost" size="sm" onClick={() => goTo(1)}>
            <Pencil /> Editar
          </Button>
        </div>
        <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
          <div>
            <dt className="flex items-center gap-2 font-display font-bold">
              <Wallet className="size-4 text-primary" aria-hidden="true" /> Pagamento
            </dt>
            <dd className="text-muted-foreground">
              {payment.method ? PAYMENT_METHOD_LABEL[payment.method] : "—"}
              {payment.method === "cash" && payment.needsChange && payment.changeFor
                ? ` · Troco para R$ ${payment.changeFor}`
                : ""}
            </dd>
          </div>
          <Button variant="ghost" size="sm" onClick={() => goTo(2)}>
            <Pencil /> Editar
          </Button>
        </div>
        <div className="flex items-center gap-2 border-t border-border pt-3 text-muted-foreground">
          <Clock className="size-4 text-primary" aria-hidden="true" />
          Prazo estimado: {summary.etaMinutes} minutos
        </div>
      </dl>

      <PriceSummary
        subtotal={summary.subtotal}
        deliveryFee={summary.deliveryFee}
        discount={summary.discount}
        total={summary.total}
        couponCode={appliedCoupon?.code ?? null}
        className="rounded-card border border-border p-4"
      />

      {blockingReason ? (
        <p role="alert" className="rounded-card border border-destructive/40 bg-destructive/10 p-3 text-small text-destructive">
          {blockingReason}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={back} className="flex-1">
          Voltar
        </Button>
        <Button size="lg" className="flex-1" onClick={submit} disabled={!canSubmit} loading={isSubmitting}>
          Confirmar Pedido
        </Button>
      </div>
    </section>
  );
}
