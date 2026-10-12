import { supabase } from "@/integrations/supabase/client";
import type { AddressInput, SavedAddress } from "@/features/checkout/types";

/** Kero Mais — Cadastro do cliente e agenda de endereços. */
export const CustomerService = {
  async getCurrent() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone, email")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async listAddresses(): Promise<SavedAddress[]> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from("delivery_addresses")
      .select("id, label, zip, street, number, complement, district, city, state, reference, is_favorite")
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as SavedAddress[];
  },

  async saveAddress(address: AddressInput & { is_favorite?: boolean }) {
    const current = await CustomerService.getCurrent();
    if (!current) throw new Error("Entre na sua conta para salvar endereços.");
    const { data, error } = await supabase
      .from("delivery_addresses")
      .insert({ ...address, customer_id: current.id, is_favorite: address.is_favorite ?? false })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async setFavorite(addressId: string) {
    const current = await CustomerService.getCurrent();
    if (!current) throw new Error("Entre na sua conta para gerenciar endereços.");
    await supabase
      .from("delivery_addresses")
      .update({ is_favorite: false })
      .eq("customer_id", current.id);
    const { error } = await supabase
      .from("delivery_addresses")
      .update({ is_favorite: true })
      .eq("id", addressId);
    if (error) throw new Error(error.message);
  },

  async removeAddress(addressId: string) {
    const { error } = await supabase.from("delivery_addresses").delete().eq("id", addressId);
    if (error) throw new Error(error.message);
  },
};
