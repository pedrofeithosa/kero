import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "./CatalogService";

export type CouponRow = Tables<"coupons">;

export const CouponAdminService = {
  async list() {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async create(input: TablesInsert<"coupons">) {
    const { data, error } = await supabase
      .from("coupons")
      .insert({ ...input, code: input.code.toUpperCase() })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logActivity("cupom.criado", "coupons", data.id, { codigo: data.code });
    return data;
  },
  async update(id: string, input: TablesUpdate<"coupons">) {
    const { error } = await supabase.from("coupons").update(input).eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity("cupom.atualizado", "coupons", id, input as Record<string, unknown>);
  },
};
