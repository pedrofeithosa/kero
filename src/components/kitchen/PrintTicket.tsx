import { createPortal } from "react-dom";
import type { KitchenOrder } from "@/services/KitchenService";
import { addressLines, brl, changeToReturn, formatPhone, orderNumber, paymentText } from "./kitchenFormat";

/** Linha com texto à esquerda e valor à direita (preços e totais). */
function Row({ left, right, bold }: { left: string; right?: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, fontWeight: bold ? 800 : 400 }}>
      <span>{left}</span>
      {right ? <span style={{ whiteSpace: "nowrap" }}>{right}</span> : null}
    </div>
  );
}

const Label = ({ children }: { children: string }) => (
  <p style={{ fontWeight: 800, letterSpacing: 1 }}>{children}</p>
);

/**
 * Comanda para impressora térmica (papel de 58 mm; para 80 mm troque a largura em styles.css).
 * Serve para a cozinha E acompanha o lanche na sacola até o entregador:
 * cliente, endereço, itens, valores e forma de pagamento.
 * Fica escondida na tela e só aparece na hora de imprimir (window.print).
 */
export function PrintTicket({ order }: { order: KitchenOrder | null }) {
  if (!order || typeof document === "undefined") return null;
  const isDelivery = order.delivery_type === "delivery";
  const address = addressLines(order);
  const troco = changeToReturn(order);
  const when = new Date(order.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return createPortal(
    <div className="kds-print">
      <p className="kds-print-title">KERO MAIS</p>
      <p className="kds-print-title">{orderNumber(order.number)}</p>
      <p className="kds-print-title" style={{ fontSize: 17 }}>
        {isDelivery ? "*** ENTREGA ***" : "*** RETIRADA ***"}
      </p>
      <p style={{ textAlign: "center" }}>{when}</p>
      {order.scheduled_for ? (
        <p style={{ textAlign: "center", fontWeight: 800 }}>
          AGENDADO: {new Date(order.scheduled_for).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
        </p>
      ) : null}
      <hr />

      <Label>CLIENTE</Label>
      <p>{order.customer_snapshot?.name || "Cliente"}</p>
      {order.customer_snapshot?.phone ? <p>Tel.: {formatPhone(order.customer_snapshot.phone)}</p> : null}

      {isDelivery ? (
        <>
          <hr />
          <Label>ENDEREÇO DE ENTREGA</Label>
          {address.length > 0 ? (
            address.map((line, i) => <p key={i}>{line}</p>)
          ) : (
            <p>(endereço não informado)</p>
          )}
        </>
      ) : null}
      <hr />

      <Label>PEDIDO</Label>
      {order.order_items.map((item) => (
        <div key={item.id} className="kds-print-item">
          <Row left={`${item.quantity}x ${item.product_name}`} right={brl(item.total)} bold />
          {(item.product_options ?? []).map((o, i) => (
            <p key={i}>{o.name.startsWith("Sem ") ? `  - ${o.name}` : `  + ${o.name}`}</p>
          ))}
          {item.observations ? <p>  OBS: {item.observations}</p> : null}
        </div>
      ))}
      {order.notes ? <p>OBS. DO PEDIDO: {order.notes}</p> : null}
      <hr />

      <Row left="Subtotal" right={brl(order.subtotal)} />
      {isDelivery ? <Row left="Taxa de entrega" right={brl(order.delivery_fee)} /> : null}
      {Number(order.discount) > 0 ? (
        <Row left={order.coupon_code ? `Desconto (${order.coupon_code})` : "Desconto"} right={`-${brl(order.discount)}`} />
      ) : null}
      <div className="kds-print-title" style={{ textAlign: "left" }}>
        <Row left="TOTAL" right={brl(order.total)} bold />
      </div>
      <hr />

      <Label>PAGAMENTO</Label>
      <p style={{ fontWeight: 800 }}>{paymentText(order)}</p>
      {troco ? <p style={{ fontWeight: 800 }}>LEVAR TROCO: {brl(troco)}</p> : null}
    </div>,
    document.body,
  );
}
