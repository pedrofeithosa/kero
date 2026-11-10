import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { KitchenOrder } from "@/services/KitchenService";
import { orderNumber, paymentText } from "./kitchenFormat";

/** Motivos mais comuns na operação. O motivo aparece para o cliente na página do pedido. */
export const KITCHEN_CANCEL_REASONS = [
  "Entregamos apenas em Pedreira",
  "Produto indisponível",
  "Cliente pediu para cancelar",
  "Não conseguimos falar com o cliente",
  "Pedido duplicado ou de teste",
  "Outro motivo",
] as const;

interface Props {
  order: KitchenOrder | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => void;
}

function CancelForm({ order, busy, onClose, onConfirm }: Required<Pick<Props, "busy" | "onClose" | "onConfirm">> & { order: KitchenOrder }) {
  const [reason, setReason] = React.useState<string>("");
  const [note, setNote] = React.useState("");
  const isOther = reason === "Outro motivo";
  const canConfirm = reason !== "" && (!isOther || note.trim().length >= 3);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cancelar pedido {orderNumber(order.number)}?</DialogTitle>
        <DialogDescription>
          {order.customer_snapshot?.name || "Cliente"} — o cliente verá que o pedido foi cancelado e o motivo.
        </DialogDescription>
      </DialogHeader>

      {order.payment_status === "paid" ? (
        <p className="flex items-start gap-2 rounded-card border border-destructive/40 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Este pedido já está pago ({paymentText(order)}). Avise quem cuida do financeiro para devolver o valor.
          </span>
        </p>
      ) : null}

      <div role="radiogroup" aria-label="Motivo do cancelamento" className="grid gap-2">
        {KITCHEN_CANCEL_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={reason === r}
            onClick={() => setReason(r)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-left font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              reason === r ? "border-destructive bg-destructive/10" : "border-border hover:border-destructive/50",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {reason !== "" ? (
        <div className="space-y-1">
          <label htmlFor="cancel-note" className="text-sm font-semibold">
            {isOther ? "Explique o motivo" : "Observação (opcional)"}
          </label>
          <Textarea
            id="cancel-note"
            className="min-h-20"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      ) : null}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" size="lg" onClick={onClose} disabled={busy}>
          Voltar
        </Button>
        <Button
          variant="danger"
          size="lg"
          loading={busy}
          disabled={!canConfirm}
          onClick={() => onConfirm(isOther ? note.trim() : reason, isOther ? "" : note.trim())}
        >
          Cancelar pedido
        </Button>
      </DialogFooter>
    </>
  );
}

export function CancelOrderDialog({ order, busy, onClose, onConfirm }: Props) {
  return (
    <Dialog open={order !== null} onOpenChange={(open) => (!open && !busy ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {/* key: ao abrir outro pedido o formulário começa limpo */}
        {order ? <CancelForm key={order.id} order={order} busy={busy} onClose={onClose} onConfirm={onConfirm} /> : null}
      </DialogContent>
    </Dialog>
  );
}
