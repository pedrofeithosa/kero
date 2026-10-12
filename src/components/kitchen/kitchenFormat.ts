import type { KitchenOrder } from "@/services/KitchenService";

export const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

export const orderNumber = (n: number) => `#${String(n).padStart(6, "0")}`;

export function paymentText(o: KitchenOrder): string {
  switch (o.payment_method) {
    case "cash":
      return o.change_for ? `Dinheiro — troco para ${brl(o.change_for)}` : "Dinheiro — sem troco";
    case "pix":
      return o.payment_status === "paid" ? "PIX — PAGO" : "PIX — aguardando pagamento";
    case "card_on_delivery":
      return "Cartão na entrega (levar a maquininha)";
    case "online_card":
      return o.payment_status === "paid" ? "Cartão online — PAGO" : "Cartão online — pendente";
  }
}

export function addressLines(o: KitchenOrder): string[] {
  const a = o.address_snapshot;
  if (o.delivery_type !== "delivery" || !a) return [];
  const lines = [
    [a.street, a.number].filter(Boolean).join(", "),
    [a.complement, a.district].filter(Boolean).join(" · "),
  ];
  if (a.reference) lines.push(`Ref.: ${a.reference}`);
  return lines.filter(Boolean);
}

export function minutesSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}
