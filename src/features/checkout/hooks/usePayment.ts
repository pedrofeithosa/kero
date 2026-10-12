import * as React from "react";
import { PaymentService } from "@/services/PaymentService";
import type { PaymentMethodId } from "@/features/checkout/types";

/** Kero Mais — Dados de pagamento (PIX copia-e-cola + QR Code). */
export function usePayment({
  method,
  amount,
  reference,
}: {
  method: PaymentMethodId;
  amount: number;
  reference: string;
}) {
  const pixCode = React.useMemo(() => {
    if (method !== "pix" || amount <= 0) return null;
    return PaymentService.buildPixCode({ amount, txid: reference });
  }, [method, amount, reference]);

  const qrCodeUrl = pixCode ? PaymentService.qrCodeUrl(pixCode) : null;

  const copy = React.useCallback(async () => {
    if (!pixCode) return false;
    try {
      await navigator.clipboard.writeText(pixCode);
      return true;
    } catch {
      return false;
    }
  }, [pixCode]);

  return { pixCode, qrCodeUrl, copy, isOnline: PaymentService.isOnline(method) };
}
