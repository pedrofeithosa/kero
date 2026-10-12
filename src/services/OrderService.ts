import { supabase } from "@/integrations/supabase/client";
import type { CreateOrderPayload, CreatedOrder, OrderRecord } from "@/features/checkout/types";

/** Kero Mais — Criação e leitura de pedidos.
 *  A criação passa obrigatoriamente pela função `create_order` do banco,
 *  que revalida horário, área de entrega, cupom e valores.
 */
export const OrderService = {
  async create(payload: CreateOrderPayload): Promise<CreatedOrder> {
    const { data, error } = await supabase.rpc("create_order", {
      payload: payload as unknown as never,
    });
    if (error) throw new Error(error.message);
    return data as unknown as CreatedOrder;
  },

  async getByToken(token: string): Promise<OrderRecord | null> {
    const { data, error } = await supabase.rpc("get_order_by_token", { _token: token });
    if (error) throw new Error(error.message);
    return (data as unknown as OrderRecord | null) ?? null;
  },

  async listMine() {
    const { data, error } = await supabase
      .from("orders")
      .select("id, number, status, total, delivery_type, created_at, tracking_token")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  /** Assina atualizações em tempo real do pedido (Realtime). */
  subscribe(orderId: string, onChange: () => void) {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        onChange,
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_status_events", filter: `order_id=eq.${orderId}` },
        onChange,
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
