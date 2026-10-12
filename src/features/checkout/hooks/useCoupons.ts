import * as React from "react";
import { toast } from "sonner";
import { CouponService } from "@/services/CouponService";
import type { CouponValidation } from "@/features/checkout/types";

interface UseCouponsArgs {
  subtotal: number;
  deliveryFee: number;
  categoryIds: string[];
  productIds: string[];
}

/** Kero Mais — Aplicação e revalidação de cupons (regras no servidor). */
export function useCoupons({ subtotal, deliveryFee, categoryIds, productIds }: UseCouponsArgs) {
  const [coupon, setCoupon] = React.useState<CouponValidation | null>(null);
  const [isApplying, setApplying] = React.useState(false);

  const apply = React.useCallback(
    async (code: string) => {
      if (!code.trim()) return false;
      setApplying(true);
      try {
        const result = await CouponService.validate({
          code,
          subtotal,
          deliveryFee,
          categoryIds,
          productIds,
        });
        if (!result.valid) {
          toast.error(result.reason ?? "Cupom inválido");
          setCoupon(null);
          return false;
        }
        setCoupon(result);
        toast.success(`Cupom ${result.code} aplicado`);
        return true;
      } catch (error) {
        toast.error((error as Error).message);
        return false;
      } finally {
        setApplying(false);
      }
    },
    [subtotal, deliveryFee, categoryIds, productIds],
  );

  const remove = React.useCallback(() => setCoupon(null), []);

  /* Revalida sempre que subtotal/frete mudarem (itens editados no carrinho). */
  const codeRef = coupon?.code;
  React.useEffect(() => {
    if (!codeRef) return;
    let active = true;
    void CouponService.validate({ code: codeRef, subtotal, deliveryFee, categoryIds, productIds })
      .then((result) => {
        if (!active) return;
        if (!result.valid) {
          setCoupon(null);
          toast.info(result.reason ?? "Cupom removido");
        } else {
          setCoupon(result);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeRef, subtotal, deliveryFee]);

  return { coupon, discount: coupon?.discount ?? 0, apply, remove, isApplying };
}
