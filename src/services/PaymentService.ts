import type { PaymentMethodId } from "@/features/checkout/types";

/** Kero Mais — Pagamentos.
 *  PIX estático gerado localmente (BR Code / EMV). A confirmação automática
 *  (webhook do provedor) será plugada em `confirm()` na próxima etapa.
 */

const PIX_KEY = "pedidos@keromais.com.br";
const MERCHANT_NAME = "KERO MAIS LANCHES";
const MERCHANT_CITY = "SAO PAULO";

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(value: string, max: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);
}

export const PaymentService = {
  /** Gera o código copia-e-cola do PIX para o pedido. */
  buildPixCode({ amount, txid }: { amount: number; txid: string }) {
    const merchantAccount = field("00", "br.gov.bcb.pix") + field("01", PIX_KEY);
    const payload =
      field("00", "01") +
      field("26", merchantAccount) +
      field("52", "0000") +
      field("53", "986") +
      field("54", amount.toFixed(2)) +
      field("58", "BR") +
      field("59", sanitize(MERCHANT_NAME, 25)) +
      field("60", sanitize(MERCHANT_CITY, 15)) +
      field("62", field("05", sanitize(txid, 25) || "KEROMAIS")) +
      "6304";
    return payload + crc16(payload);
  },

  qrCodeUrl(code: string) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(code)}`;
  },

  isOnline(method: PaymentMethodId) {
    return method === "pix" || method === "online_card";
  },
};
