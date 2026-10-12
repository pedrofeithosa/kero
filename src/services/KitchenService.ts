import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

export type KitchenStatus = Enums<"order_status">;

export interface KitchenOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  observations: string | null;
  product_options: Array<{ name: string; price_delta?: number }> | null;
}

export interface KitchenOrder {
  id: string;
  number: number;
  status: KitchenStatus;
  delivery_type: "delivery" | "pickup";
  payment_method: "pix" | "card_on_delivery" | "cash" | "online_card";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  change_for: number | null;
  total: number;
  eta_minutes: number;
  notes: string | null;
  created_at: string;
  scheduled_for: string | null;
  address_snapshot: {
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    reference?: string;
  } | null;
  customer_snapshot: { name?: string; phone?: string } | null;
  order_items: KitchenOrderItem[];
}

const ACTIVE: KitchenStatus[] = ["received", "accepted", "preparing", "ready", "out_for_delivery"];

/** Kero Mais — Pedidos para a cozinha (somente equipe; RLS garante o acesso). */
export const KitchenService = {
  async listActive(): Promise<KitchenOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, number, status, delivery_type, payment_method, payment_status, change_for, total, eta_minutes, notes, created_at, scheduled_for, address_snapshot, customer_snapshot, order_items(id, product_name, quantity, observations, product_options)",
      )
      .in("status", ACTIVE)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as KitchenOrder[];
  },

  async setStatus(orderId: string, status: KitchenStatus) {
    const { error } = await supabase.rpc("admin_update_order_status", {
      _order_id: orderId,
      _status: status,
    });
    if (error) throw new Error(error.message);
  },

  /** Tempo real: avisa quando um pedido muda e informa o estado da conexão. */
  subscribe(onChange: () => void, onState: (state: string) => void) {
    const channel = supabase
      .channel("kitchen-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onChange)
      .subscribe((state) => onState(String(state)));
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
