import { supabase } from "@/integrations/supabase/client";
import type { AddressInput, DeliveryAreaResult, StoreStatus } from "@/features/checkout/types";
import { onlyDigits } from "@/features/checkout/schemas";

export interface StreetSuggestion {
  street: string;
  district: string;
  city: string;
  state: string;
  zip: string;
}

/** Kero Mais — Regras de entrega: horário, área de cobertura e busca de CEP. */
export const DeliveryService = {
  async getStoreStatus(): Promise<StoreStatus> {
    const { data, error } = await supabase.rpc("store_status", {});
    if (error) throw new Error(error.message);
    return (data ?? { open: false }) as unknown as StoreStatus;
  },

  async checkArea(district: string, city?: string): Promise<DeliveryAreaResult> {
    if (!district.trim()) return { available: false, reason: "Informe o bairro." };
    const { data, error } = await supabase.rpc("check_delivery_area", {
      _district: district,
      _city: city ?? undefined,
    });
    if (error) throw new Error(error.message);
    return data as unknown as DeliveryAreaResult;
  },

  async listZones() {
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("id, district, city, fee, eta_minutes, min_order_total, free_from")
      .eq("is_active", true)
      .order("district");
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Sugestões de rua pelo nome, dentro de uma cidade (ViaCEP). Devolve [] se não achar ou se
   * o serviço estiver fora do ar — o cliente sempre pode digitar o endereço manualmente.
   */
  async searchStreets(query: string, city: string, state: string): Promise<StreetSuggestion[]> {
    const q = query.trim();
    if (q.length < 3) return [];
    try {
      const url = `https://viacep.com.br/ws/${encodeURIComponent(state)}/${encodeURIComponent(city)}/${encodeURIComponent(q)}/json/`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const json = (await response.json()) as Array<{
        cep?: string;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      }>;
      if (!Array.isArray(json)) return [];
      const seen = new Set<string>();
      const result: StreetSuggestion[] = [];
      for (const item of json) {
        if (!item.logradouro) continue;
        const key = `${item.logradouro}|${item.bairro ?? ""}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          street: item.logradouro,
          district: item.bairro ?? "",
          city: item.localidade ?? city,
          state: item.uf ?? state,
          zip: onlyDigits(item.cep ?? ""),
        });
        if (result.length >= 6) break;
      }
      return result;
    } catch {
      return [];
    }
  },

  /** Preenchimento automático por CEP (ViaCEP). Retorna null quando não encontrado. */
  async lookupZip(zip: string): Promise<Partial<AddressInput> | null> {
    const digits = onlyDigits(zip);
    if (digits.length !== 8) return null;
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const json = (await response.json()) as {
      erro?: boolean | string;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (json.erro) return null;
    return {
      zip: digits,
      street: json.logradouro ?? "",
      district: json.bairro ?? "",
      city: json.localidade ?? "",
      state: json.uf ?? "",
    };
  },
};
