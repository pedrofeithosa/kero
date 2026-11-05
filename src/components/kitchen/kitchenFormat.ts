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

/** Endereço de entrega, uma informação por linha (só para pedidos de entrega). */
export function addressLines(o: KitchenOrder): string[] {
  const a = o.address_snapshot;
  if (o.delivery_type !== "delivery" || !a) return [];
  const cityLine = [a.city, a.state].filter(Boolean).join("/");
  const lines = [
    [a.street, a.number].filter(Boolean).join(", "),
    a.complement ? `Compl.: ${a.complement}` : "",
    [a.district, cityLine].filter(Boolean).join(" — "),
  ];
  if (a.reference) lines.push(`Ref.: ${a.reference}`);
  return lines.filter(Boolean);
}

/** 19999998888 -> (19) 99999-8888 */
export function formatPhone(raw?: string | null): string {
  const d = (raw ?? "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw ?? "";
}

/** Troco que o entregador precisa levar (só pagamento em dinheiro com "troco para"). */
export function changeToReturn(o: KitchenOrder): number | null {
  if (o.payment_method !== "cash" || !o.change_for) return null;
  const diff = Number(o.change_for) - Number(o.total);
  return diff > 0 ? diff : null;
}

export function minutesSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}
