import { Clock, MapPin, Phone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { KitchenOrder, KitchenStatus } from "@/services/KitchenService";
import { addressLines, brl, minutesSince, orderNumber, paymentText } from "./kitchenFormat";

export interface KitchenAction {
  label: string;
  next: KitchenStatus;
}

/** Próximo passo de cada pedido (o botão grande do cartão). */
export function nextAction(o: KitchenOrder): KitchenAction | null {
  switch (o.status) {
    case "received":
    case "accepted":
      return { label: "Iniciar preparo", next: "preparing" };
    case "preparing":
      return { label: "Pedido pronto", next: "ready" };
    case "ready":
      return o.delivery_type === "delivery"
        ? { label: "Saiu para entrega", next: "out_for_delivery" }
        : { label: "Entregue ao cliente", next: "delivered" };
    case "out_for_delivery":
      return { label: "Entregue", next: "delivered" };
    default:
      return null;
  }
}

interface Props {
  order: KitchenOrder;
  now: number;
  busy: boolean;
  onAdvance: (order: KitchenOrder, next: KitchenStatus) => void;
  onPrint: (order: KitchenOrder) => void;
}

export function KitchenOrderCard({ order, now, busy, onAdvance, onPrint }: Props) {
  const minutes = minutesSince(order.created_at, now);
  const late = minutes > order.eta_minutes && order.status !== "out_for_delivery";
  const action = nextAction(order);
  const isNew = order.status === "received";
  const address = addressLines(order);
  const phone = order.customer_snapshot?.phone;

  return (
    <article
      className={cn(
        "rounded-2xl border-2 bg-card p-4 shadow-soft",
        isNew ? "border-primary" : "border-border",
        late && "border-destructive",
      )}
      aria-label={`Pedido ${orderNumber(order.number)}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-extrabold leading-none">{orderNumber(order.number)}</p>
          <p className="mt-1 text-sm font-bold uppercase tracking-wide">
            {order.delivery_type === "delivery" ? "🛵 Entrega" : "🏪 Retirada"}
            {isNew ? <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">NOVO</span> : null}
          </p>
        </div>
        <div className="text-right">
          <p className={cn("flex items-center justify-end gap-1 text-lg font-bold", late && "text-destructive")}>
            <Clock className="size-4" aria-hidden /> {minutes} min
          </p>
          {late ? <p className="text-xs font-extrabold uppercase text-destructive">Atrasado</p> : null}
          {order.scheduled_for ? (
            <p className="text-xs font-semibold">
              Agendado: {new Date(order.scheduled_for).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-3 border-t pt-3">
        <p className="font-semibold">{order.customer_snapshot?.name || "Cliente"}</p>
        {phone ? (
          <a href={`tel:${phone}`} className="mt-1 inline-flex items-center gap-1 text-sm text-primary underline">
            <Phone className="size-4" aria-hidden /> {phone}
          </a>
        ) : null}
        {address.length > 0 ? (
          <p className="mt-1 flex gap-1 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{address.map((l, i) => <span key={i} className="block">{l}</span>)}</span>
          </p>
        ) : null}
      </div>

      <ul className="mt-3 space-y-3 border-t pt-3">
        {order.order_items.map((item) => (
          <li key={item.id}>
            <p className="text-lg font-bold leading-tight">
              {item.quantity}x {item.product_name}
            </p>
            {(item.product_options ?? []).length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {(item.product_options ?? []).map((o) => o.name).join(" · ")}
              </p>
            ) : null}
            {item.observations ? (
              <p className="mt-1 rounded bg-highlight/20 px-2 py-1 text-sm font-semibold">Obs.: {item.observations}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {order.notes ? (
        <p className="mt-3 rounded bg-highlight/20 px-2 py-1 text-sm font-semibold">Pedido: {order.notes}</p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 text-sm">
        <span className="font-medium">{paymentText(order)}</span>
        <span className="font-display text-lg font-extrabold">{brl(order.total)}</span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        {action ? (
          <Button size="xl" full loading={busy} onClick={() => onAdvance(order, action.next)}>
            {action.label}
          </Button>
        ) : (
          <span />
        )}
        <Button size="xl" variant="outline" aria-label="Imprimir comanda" onClick={() => onPrint(order)}>
          <Printer />
        </Button>
      </div>
    </article>
  );
}
