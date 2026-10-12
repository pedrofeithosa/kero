import { supabase } from "@/integrations/supabase/client";

export interface AdminMetrics {
  range: { from: string; to: string };
  current: {
    revenue: number;
    orders: number;
    cancelled: number;
    avg_ticket: number;
    in_progress: number;
  };
  previous: { revenue: number; orders: number; avg_ticket: number; has_data: boolean };
  customers_total: number;
  customers_new: number;
  by_day: Array<{ day: string; revenue: number; orders: number }>;
  by_hour: Array<{ hour: number; orders: number }>;
  by_payment: Array<{ method: string; orders: number; revenue: number }>;
  top_products: Array<{ name: string; quantity: number; revenue: number }>;
  top_categories: Array<{ category: string; quantity: number; revenue: number }>;
}

export const MetricsService = {
  async get(from: Date, to: Date): Promise<AdminMetrics> {
    const { data, error } = await supabase.rpc("admin_metrics", {
      _from: from.toISOString(),
      _to: to.toISOString(),
    });
    if (error) throw new Error(error.message);
    return data as unknown as AdminMetrics;
  },
};

export type RangeId = "today" | "7d" | "30d" | "90d";

export const RANGE_LABELS: Record<RangeId, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
};

export function resolveRange(id: RangeId): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  if (id === "7d") from.setDate(from.getDate() - 6);
  if (id === "30d") from.setDate(from.getDate() - 29);
  if (id === "90d") from.setDate(from.getDate() - 89);
  return { from, to };
}
