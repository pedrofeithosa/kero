import { supabase } from "@/integrations/supabase/client";

export interface AdminCustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
}

export const CustomerAdminService = {
  async list(params: { search?: string; limit?: number; offset?: number }) {
    const { data, error } = await supabase.rpc("admin_customers", {
      _search: params.search && params.search.length > 0 ? params.search : undefined,
      _limit: params.limit ?? 50,
      _offset: params.offset ?? 0,
    });
    if (error) throw new Error(error.message);
    return data as unknown as { total: number; rows: AdminCustomerRow[] };
  },

  async detail(customerId: string) {
    const [{ data: customer, error: e1 }, { data: orders, error: e2 }, { data: addresses }] =
      await Promise.all([
        supabase.from("customers").select("*").eq("id", customerId).single(),
        supabase
          .from("orders")
          .select("id, number, status, total, created_at, delivery_type")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false }),
        supabase.from("delivery_addresses").select("*").eq("customer_id", customerId),
      ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    return { customer, orders: orders ?? [], addresses: addresses ?? [] };
  },
};
