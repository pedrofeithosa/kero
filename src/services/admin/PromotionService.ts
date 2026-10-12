import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "./CatalogService";

export type PromotionRow = Tables<"promotions">;

export const PromotionService = {
  async list() {
    const { data, error } = await supabase
      .from("promotions")
      .select("*, products(name), categories(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<
      PromotionRow & { products: { name: string } | null; categories: { name: string } | null }
    >;
  },
  async create(input: TablesInsert<"promotions">) {
    const { data, error } = await supabase.from("promotions").insert(input).select().single();
    if (error) throw new Error(error.message);
    await logActivity("promocao.criada", "promotions", data.id, { titulo: data.title });
    return data;
  },
  async update(id: string, input: TablesUpdate<"promotions">) {
    const { error } = await supabase
      .from("promotions")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity("promocao.atualizada", "promotions", id, input as Record<string, unknown>);
  },
  async remove(id: string) {
    const { error } = await supabase.from("promotions").update({ is_active: false }).eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity("promocao.desativada", "promotions", id);
  },
};

/** Status derivado de uma promoção (agendada, ativa, expirada, inativa). */
export function promotionStatus(p: Pick<PromotionRow, "is_active" | "starts_at" | "ends_at">) {
  if (!p.is_active) return { label: "Inativa", tone: "muted" as const };
  const now = Date.now();
  if (p.starts_at && new Date(p.starts_at).getTime() > now)
    return { label: "Agendada", tone: "info" as const };
  if (p.ends_at && new Date(p.ends_at).getTime() < now)
    return { label: "Expirada", tone: "muted" as const };
  return { label: "Ativa", tone: "success" as const };
}
