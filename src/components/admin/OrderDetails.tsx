import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order/OrderStatus";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatBRL } from "@/components/admin/PriceInput";
import {
  CANCEL_REASONS,
  ORDER_STATUS_LABELS,
  OrderAdminService,
  type OrderStatus,
} from "@/services/admin/OrderAdminService";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  received: ["accepted"],
  accepted: ["preparing"],
  preparing: ["ready"],
  ready: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

interface Props {
  orderId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetails({ orderId, onOpenChange }: Props) {
  const { can } = useAdminAuth();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reason, setReason] = React.useState<string>(CANCEL_REASONS[0]);
  const [note, setNote] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "order", orderId],
    queryFn: () => OrderAdminService.detail(orderId!),
    enabled: Boolean(orderId),
  });

  const mutation = useMutation({
    mutationFn: (input: { status: OrderStatus; reason?: string; note?: string }) =>
      OrderAdminService.updateStatus(orderId!, input.status, input.reason, input.note),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "order", orderId] });
      toast.success("Status do pedido atualizado.");
      setCancelOpen(false);
      setNote("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const order = data as
    | (Record<string, unknown> & {
        number: number;
        status: OrderStatus;
        total: number;
        subtotal: number;
        discount: number;
        delivery_fee: number;
        delivery_type: string;
        payment_method: string;
        payment_status: string;
        created_at: string;
        notes: string | null;
        cancel_reason: string | null;
        cancel_note: string | null;
        customer_snapshot: { name?: string; phone?: string; email?: string } | null;
        address_snapshot: Record<string, string> | null;
        order_items: Array<{
          id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total: number;
          observations: string | null;
          product_options: unknown;
        }>;
        order_status_events: Array<{ id: string; status: OrderStatus; note: string | null; created_at: string }>;
      })
    | undefined;

  return (
    <Sheet open={Boolean(orderId)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {order ? `Pedido #${String(order.number).padStart(6, "0")}` : "Detalhes do pedido"}
          </SheetTitle>
        </SheetHeader>

        {isLoading || !order ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6 p-4">
            <div className="flex items-center justify-between gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleString("pt-BR")}
              </span>
            </div>

            <section className="rounded-2xl border p-4 text-sm">
              <h4 className="mb-2 font-semibold">Cliente</h4>
              <p>{order.customer_snapshot?.name ?? "—"}</p>
              <p className="text-muted-foreground">{order.customer_snapshot?.phone ?? "—"}</p>
              {order.customer_snapshot?.email ? (
                <p className="text-muted-foreground">{order.customer_snapshot.email}</p>
              ) : null}
            </section>

            <section className="rounded-2xl border p-4 text-sm">
              <h4 className="mb-2 font-semibold">
                {order.delivery_type === "delivery" ? "Entrega" : "Retirada na loja"}
              </h4>
              {order.address_snapshot ? (
                <p className="text-muted-foreground">
                  {order.address_snapshot["street"]}, {order.address_snapshot["number"]}
                  {order.address_snapshot["complement"] ? ` — ${order.address_snapshot["complement"]}` : ""}
                  <br />
                  {order.address_snapshot["district"]} · {order.address_snapshot["city"]}/
                  {order.address_snapshot["state"]}
                </p>
              ) : (
                <p className="text-muted-foreground">Cliente retira no balcão.</p>
              )}
            </section>

            <section className="rounded-2xl border p-4 text-sm">
              <h4 className="mb-3 font-semibold">Itens</h4>
              <ul className="space-y-3">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>
                      <span className="font-medium">{item.quantity}x</span> {item.product_name}
                      {item.observations ? (
                        <span className="block text-xs text-muted-foreground">Obs.: {item.observations}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums">{formatBRL(item.total)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatBRL(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Entrega</dt>
                  <dd className="tabular-nums">{formatBRL(order.delivery_fee)}</dd>
                </div>
                {order.discount > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Desconto</dt>
                    <dd className="tabular-nums text-success">-{formatBRL(order.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatBRL(order.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Pagamento: {order.payment_method} · {order.payment_status}
              </p>
            </section>

            {order.cancel_reason ? (
              <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
                <h4 className="mb-1 font-semibold text-destructive">Pedido cancelado</h4>
                <p>{order.cancel_reason}</p>
                {order.cancel_note ? <p className="text-muted-foreground">{order.cancel_note}</p> : null}
              </section>
            ) : null}

            <section className="rounded-2xl border p-4 text-sm">
              <h4 className="mb-3 font-semibold">Histórico</h4>
              <ul className="space-y-2">
                {order.order_status_events
                  .slice()
                  .sort((a, b) => a.created_at.localeCompare(b.created_at))
                  .map((event) => (
                    <li key={event.id} className="flex justify-between gap-3 text-xs">
                      <span>{ORDER_STATUS_LABELS[event.status]}</span>
                      <span className="text-muted-foreground">
                        {new Date(event.created_at).toLocaleString("pt-BR")}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>

            {can("orders.status") ? (
              <div className="flex flex-wrap gap-2">
                {NEXT_STATUS[order.status].map((next) => (
                  <Button
                    key={next}
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ status: next })}
                  >
                    Marcar como {ORDER_STATUS_LABELS[next].toLowerCase()}
                  </Button>
                ))}
                {can("orders.cancel") && order.status !== "cancelled" && order.status !== "delivered" ? (
                  <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)}>
                    Cancelar pedido
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title="Cancelar pedido"
          description="O pedido permanece no histórico com o motivo registrado."
          confirmLabel="Cancelar pedido"
          destructive
          loading={mutation.isPending}
          onConfirm={() => mutation.mutate({ status: "cancelled", reason, note: note || undefined })}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Motivo</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANCEL_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cancel-note">Observação (opcional)</Label>
              <Textarea id="cancel-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
          </div>
        </ConfirmDialog>
      </SheetContent>
    </Sheet>
  );
}
