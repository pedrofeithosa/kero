import * as React from "react";
import type { DeliveryAreaResult, DeliveryType } from "@/features/checkout/types";

interface UseOrderSummaryArgs {
  subtotal: number;
  deliveryType: DeliveryType;
  area?: DeliveryAreaResult | undefined;
  discount: number;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  etaMinutes: number;
  minOrderTotal: number;
  belowMinimum: boolean;
  freeFrom: number | null;
  missingForFreeDelivery: number;
}

/** Kero Mais — Cálculo do resumo do pedido em tempo real. */
export function useOrderSummary({
  subtotal,
  deliveryType,
  area,
  discount,
}: UseOrderSummaryArgs): OrderSummary {
  return React.useMemo(() => {
    const isDelivery = deliveryType === "delivery";
    const zoneFee = isDelivery && area?.available ? (area.fee ?? 0) : 0;
    const freeFrom = isDelivery ? (area?.free_from ?? null) : null;
    const freeDelivery = freeFrom !== null && subtotal >= freeFrom;
    const deliveryFee = freeDelivery ? 0 : zoneFee;
    const minOrderTotal = isDelivery ? (area?.min_order_total ?? 0) : 0;
    const cappedDiscount = Math.min(discount, subtotal + deliveryFee);

    return {
      subtotal,
      deliveryFee,
      discount: cappedDiscount,
      total: Math.max(0, subtotal + deliveryFee - cappedDiscount),
      etaMinutes: isDelivery ? (area?.eta_minutes ?? 45) : 20,
      minOrderTotal,
      belowMinimum: isDelivery && subtotal < minOrderTotal,
      freeFrom,
      missingForFreeDelivery: freeFrom !== null ? Math.max(0, freeFrom - subtotal) : 0,
    };
  }, [subtotal, deliveryType, area, discount]);
}
