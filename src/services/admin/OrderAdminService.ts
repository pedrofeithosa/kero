import { supabase } from "@/integrations/supabase/client";
import type { Enums, Tables } from "@/integrations/supabase/types";

export type OrderStatus = Enums<"order_status">;
export type AdminOrder = Tables<"orders">;

export const CANCEL_REASONS = [
  "Produto indisponível",
  "Cliente cancelou",
  "Problema operacional",
  "Pagamento não confirmado",
  "Outro",
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Novo",
  accepted: "Aceito",
  preparing: "Em preparo",
  ready: "Pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Finalizado",
  cancelled: "Cancelado",
};

export const OrderAdminService = {
  async list(params: { status?: OrderStatus | "all"; search?: string; from?: string; to?: string; limit?: number }) {
    let query = supabase
      .from("orders")
      .select("*, customers(name, phone, email)")
      .order("created_at", { ascending: false })
      .limit(params.limit ?? 50);
    if (params.status && params.status !== "all") query = query.eq("status", params.status);
    if (params.from) query = query.gte("created_at", params.from);
    if (params.to) query = query.lt("created_at", params.to);
    if (params.search) query = query.ilike("number", `%${params.search}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<AdminOrder & { customers: { name: string; phone: string; email: string | null } | null }>;
  },

  async detail(id: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "*, customers(*), order_items(*), payments(*), delivery_addresses(*), order_status_events(*)",
      )
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateStatus(orderId: string, status: OrderStatus, reason?: string, note?: string) {
    const { error } = await supabase.rpc("admin_update_order_status", {
      _order_id: orderId,
      _status: status,
      _reason: reason,
      _note: note,
    });
    if (error) throw new Error(error.message);
  },

  /** Atualizações em tempo real da lista de pedidos. */
  subscribe(onChange: () => void) {
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onChange)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
