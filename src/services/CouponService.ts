import { supabase } from "@/integrations/supabase/client";
import type { CouponValidation } from "@/features/checkout/types";

/** Kero Mais — Validação de cupons (regras aplicadas no servidor). */
export const CouponService = {
  async validate(params: {
    code: string;
    subtotal: number;
    deliveryFee: number;
    categoryIds: string[];
    productIds: string[];
  }): Promise<CouponValidation> {
    const { data, error } = await supabase.rpc("validate_coupon", {
      _code: params.code,
      _subtotal: params.subtotal,
      _delivery_fee: params.deliveryFee,
      _category_ids: params.categoryIds,
      _product_ids: params.productIds,
    });
    if (error) throw new Error(error.message);
    return data as unknown as CouponValidation;
  },

  async listActive() {
    const { data, error } = await supabase
      .from("coupons")
      .select("code, description, discount_type, discount_value, min_order_total")
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    return data;
  },
};
