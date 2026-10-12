import * as React from "react";
import { QrCode, CreditCard, Banknote, Wallet, Ticket, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/features/checkout/CheckoutProvider";
import { usePayment } from "@/features/checkout/hooks/usePayment";
import type { PaymentMethodId } from "@/features/checkout/types";

const METHODS: Array<{ id: PaymentMethodId; label: string; desc: string; icon: typeof QrCode; soon?: boolean }> = [
  { id: "pix", label: "PIX", desc: "Aprovação imediata", icon: QrCode },
  { id: "card_on_delivery", label: "Cartão na entrega", desc: "Maquininha no local", icon: CreditCard },
  { id: "cash", label: "Dinheiro", desc: "Informe se precisa de troco", icon: Banknote },
  { id: "online_card", label: "Cartão online", desc: "Em breve", icon: Wallet, soon: true },
];

/** Kero Mais — Etapa 3: pagamento, cupom e observações */
export function PaymentStep() {
  const {
    payment,
    setPayment,
    next,
    back,
    couponCode,
    setCouponCode,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    isApplyingCoupon,
    summary,
  } = useCheckout();

  const [changeError, setChangeError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const { pixCode, qrCodeUrl, copy } = usePayment({
    method: payment.method ?? "pix",
    amount: summary.total,
    reference: "KEROMAIS",
  });

  const handleContinue = () => {
    if (!payment.method) return;
    if (payment.method === "cash" && payment.needsChange) {
      const value = Number(payment.changeFor.replace(",", "."));
      if (!value || value < summary.total) {
        setChangeError("Informe um valor de troco maior que o total do pedido.");
        return;
      }
    }
    setChangeError(null);
    next();
  };

  return (
    <section aria-labelledby="pagamento-title" className="space-y-6">
      <header className="space-y-1">
        <h2 id="pagamento-title" className="font-display text-h4 font-extrabold">
          Como prefere pagar?
        </h2>
        <p className="text-small text-muted-foreground">Escolha a forma de pagamento e aplique seu cupom.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Forma de pagamento">
        {METHODS.map((method) => {
          const active = payment.method === method.id;
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={method.soon}
              onClick={() => setPayment({ method: method.id })}
              className={cn(
                "flex items-center gap-3 rounded-card border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <method.icon className={cn("size-6", active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-display font-bold">
                  {method.label}
                  {method.soon ? <Badge variant="muted">Em breve</Badge> : null}
                </span>
                <span className="block text-caption text-muted-foreground">{method.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {payment.method === "cash" ? (
        <div className="space-y-3 rounded-card border border-border p-4">
          <label className="flex items-center gap-3 text-small font-semibold">
            <Checkbox
              checked={payment.needsChange}
              onCheckedChange={(v) => setPayment({ needsChange: Boolean(v) })}
            />
            Precisa de troco?
          </label>
          {payment.needsChange ? (
            <div className="space-y-2">
              <Label htmlFor="changeFor">Troco para quanto?</Label>
              <Input
                id="changeFor"
                inputMode="decimal"
                placeholder="100,00"
                value={payment.changeFor}
                onChange={(e) => setPayment({ changeFor: e.target.value })}
                aria-invalid={!!changeError}
              />
              {changeError ? <p className="text-caption text-destructive">{changeError}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {payment.method === "pix" && pixCode ? (
        <div className="space-y-3 rounded-card border border-border p-4 text-center">
          <p className="font-display font-bold">Pague com PIX</p>
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="QR Code PIX para pagamento do pedido"
              loading="lazy"
              className="mx-auto size-52 rounded-xl border border-border bg-card"
            />
          ) : null}
          <p className="break-all rounded-xl bg-muted p-3 text-caption text-muted-foreground">{pixCode}</p>
          <Button
            variant="outline"
            onClick={async () => {
              const ok = await copy();
              setCopied(ok);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check /> : <Copy />} {copied ? "Copiado!" : "Copiar código"}
          </Button>
          <p className="text-caption text-muted-foreground">
            A confirmação do pagamento é feita pela nossa equipe assim que o PIX cair.
          </p>
        </div>
      ) : null}

      <div className="space-y-2 rounded-card border border-border p-4">
        <Label htmlFor="coupon" className="flex items-center gap-2">
          <Ticket className="size-4 text-primary" aria-hidden="true" /> Cupom de desconto
        </Label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-success/10 p-3">
            <span className="font-display text-small font-bold text-success">
              {appliedCoupon.code} aplicado
            </span>
            <Button variant="ghost" size="icon-sm" aria-label="Remover cupom" onClick={removeCoupon}>
              <X />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="KERO10"
            />
            <Button
              variant="secondary"
              disabled={isApplyingCoupon || !couponCode.trim()}
              onClick={() => void applyCoupon(couponCode)}
            >
              Aplicar
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações do pedido (opcional)</Label>
        <Textarea
          id="notes"
          maxLength={300}
          rows={3}
          placeholder="Ex.: interfone quebrado, ligar ao chegar"
          value={payment.notes}
          onChange={(e) => setPayment({ notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={back} className="flex-1">
          Voltar
        </Button>
        <Button size="lg" className="flex-1" onClick={handleContinue} disabled={!payment.method}>
          Revisar pedido
        </Button>
      </div>
    </section>
  );
}
