import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { logActivity } from "./CatalogService";

export type StoreSettings = Tables<"store_settings">;
export type StoreHour = Tables<"store_hours">;
export type DeliveryZone = Tables<"delivery_zones">;

export const SettingsService = {
  async get(): Promise<StoreSettings | null> {
    const { data, error } = await supabase.from("store_settings").select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(input: TablesUpdate<"store_settings">) {
    const { error } = await supabase
      .from("store_settings")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", true);
    if (error) throw new Error(error.message);
    await logActivity("config.atualizada", "store_settings", "store", input as Record<string, unknown>);
  },

  async hours(): Promise<StoreHour[]> {
    const { data, error } = await supabase.from("store_hours").select("*").order("weekday");
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async updateHour(id: string, input: TablesUpdate<"store_hours">) {
    const { error } = await supabase.from("store_hours").update(input).eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity("horario.atualizado", "store_hours", id, input as Record<string, unknown>);
  },

  async zones(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase.from("delivery_zones").select("*").order("district");
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async createZone(input: { district: string; city: string; fee: number; eta_minutes: number }) {
    const { data, error } = await supabase.from("delivery_zones").insert(input).select().single();
    if (error) throw new Error(error.message);
    await logActivity("zona.criada", "delivery_zones", data.id, input);
    return data;
  },

  async updateZone(id: string, input: TablesUpdate<"delivery_zones">) {
    const { error } = await supabase.from("delivery_zones").update(input).eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity("zona.atualizada", "delivery_zones", id, input as Record<string, unknown>);
  },
};
