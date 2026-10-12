import { createPortal } from "react-dom";
import type { KitchenOrder } from "@/services/KitchenService";
import { addressLines, brl, orderNumber, paymentText } from "./kitchenFormat";

/**
 * Comanda para impressora térmica (papel de 58 mm; para 80 mm troque a largura em styles.css).
 * Fica escondida na tela e só aparece na hora de imprimir (window.print).
 */
export function PrintTicket({ order }: { order: KitchenOrder | null }) {
  if (!order || typeof document === "undefined") return null;
  const address = addressLines(order);
  const when = new Date(order.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return createPortal(
    <div className="kds-print">
      <p className="kds-print-title">KERO MAIS</p>
      <p className="kds-print-title">{orderNumber(order.number)}</p>
      <p>{when}</p>
      <p><strong>{order.delivery_type === "delivery" ? "ENTREGA" : "RETIRADA"}</strong></p>
      <hr />
      <p>{order.customer_snapshot?.name || "Cliente"}</p>
      {order.customer_snapshot?.phone ? <p>{order.customer_snapshot.phone}</p> : null}
      {address.map((line, i) => <p key={i}>{line}</p>)}
      <hr />
      {order.order_items.map((item) => (
        <div key={item.id} className="kds-print-item">
          <p><strong>{item.quantity}x {item.product_name}</strong></p>
          {(item.product_options ?? []).map((o, i) => <p key={i}>  + {o.name}</p>)}
          {item.observations ? <p>  OBS: {item.observations}</p> : null}
        </div>
      ))}
      {order.notes ? <p>PEDIDO: {order.notes}</p> : null}
      <hr />
      <p>{paymentText(order)}</p>
      <p className="kds-print-title">TOTAL {brl(order.total)}</p>
    </div>,
    document.body,
  );
}
