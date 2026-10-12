import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, Wallet } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatPrice } from "@/components/ui/price-tag";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { OrderStatusBadge, OrderTimeline } from "@/components/order/OrderStatus";
import { useOrder } from "@/features/orders/useOrder";
import { formatOrderNumber, PAYMENT_METHOD_LABEL, type OrderStatusId } from "@/features/checkout/types";
import { ADDRESS_LINE } from "@/lib/business";

export const Route = createFileRoute("/pedido/$token")({
  head: () => ({
    meta: [
      { title: "Acompanhar pedido — Kero Mais" },
      { name: "description", content: "Acompanhe em tempo real o preparo e a entrega do seu pedido Kero Mais." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderTrackingPage,
});

const DELIVERY_FLOW: OrderStatusId[] = [
  "received",
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];
const PICKUP_FLOW: OrderStatusId[] = ["received", "preparing", "ready", "delivered"];

function OrderTrackingPage() {
  const { token } = Route.useParams();
  const { data: order, isLoading } = useOrder(token);

  if (isLoading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </PublicShell>
    );
  }

  if (!order) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-lg px-4 py-20">
          <EmptyState title="Pedido não encontrado" description="Confira o link de acompanhamento recebido." />
        </div>
      </PublicShell>
    );
  }

  const flow = order.delivery_type === "pickup" ? PICKUP_FLOW : DELIVERY_FLOW;
  const currentIndex = flow.indexOf(order.status);
  const steps =
    order.status === "cancelled"
      ? [{ status: "cancelled" as OrderStatusId, current: true }]
      : flow.map((status, index) => ({
          status,
          done: index < currentIndex,
          current: index === currentIndex,
          time: order.events.find((e) => e.status === status)
            ? new Date(order.events.find((e) => e.status === status)!.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        }));

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <header className="space-y-3 rounded-card border border-success/40 bg-success/10 p-6 text-center">
          <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
          <h1 className="font-display text-h3 font-extrabold">Seu pedido foi recebido com sucesso</h1>
          <p className="font-display text-h5 font-bold text-primary">{formatOrderNumber(order.number)}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-small text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-4" aria-hidden="true" /> ~{order.eta_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-4" aria-hidden="true" /> {PAYMENT_METHOD_LABEL[order.payment_method]}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
        </header>

        <section className="rounded-card border border-border p-6">
          <h2 className="mb-4 font-display text-h5 font-extrabold">Acompanhamento</h2>
          <OrderTimeline steps={steps} />
        </section>

        <section className="space-y-4 rounded-card border border-border p-6">
          <h2 className="font-display text-h5 font-extrabold">Resumo</h2>
          <ul className="space-y-2 text-small">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="font-semibold">
                    {item.quantity}× {item.product_name}
                  </span>
                  {item.product_options?.length ? (
                    <span className="block text-caption text-muted-foreground">
                      {item.product_options.map((o) => o.name).join(" · ")}
                    </span>
                  ) : null}
                  {item.observations ? (
                    <span className="block text-caption text-muted-foreground">Obs.: {item.observations}</span>
                  ) : null}
                </span>
                <span className="font-semibold">{formatPrice(Number(item.total))}</span>
              </li>
            ))}
          </ul>
          <PriceSummary
            subtotal={Number(order.subtotal)}
            deliveryFee={Number(order.delivery_fee)}
            discount={Number(order.discount)}
            total={Number(order.total)}
            couponCode={order.coupon_code}
            className="border-t border-border pt-4"
          />
          <p className="flex items-start gap-2 text-small text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {order.delivery_type === "delivery" && order.address
              ? `${order.address.street}, ${order.address.number} · ${order.address.district}, ${order.address.city}/${order.address.state}`
              : `Retirada no balcão — ${ADDRESS_LINE}`}
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="flex-1">
            <Link to="/cardapio">Voltar ao cardápio</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1">
            <Link to="/conta/pedidos">Meus pedidos</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
