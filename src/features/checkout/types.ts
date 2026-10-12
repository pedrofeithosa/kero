/** Kero Mais — Tipos do módulo de Pedidos / Checkout */

export type DeliveryType = "delivery" | "pickup";

export type PaymentMethodId = "pix" | "card_on_delivery" | "cash" | "online_card";

export type OrderStatusId =
  | "received"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatusId = "pending" | "paid" | "failed" | "refunded";

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
}

export interface AddressInput {
  zip: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  reference?: string;
}

export interface SavedAddress extends AddressInput {
  id: string;
  label?: string | null;
  is_favorite: boolean;
}

export interface StoreStatus {
  open: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
  reason?: string | null;
}

export interface DeliveryAreaResult {
  available: boolean;
  reason?: string;
  zone_id?: string;
  district?: string;
  city?: string;
  fee?: number;
  eta_minutes?: number;
  min_order_total?: number;
  free_from?: number | null;
}

export interface CouponValidation {
  valid: boolean;
  reason?: string;
  coupon_id?: string;
  code?: string;
  discount?: number;
  discount_type?: "percent" | "fixed" | "free_shipping";
  description?: string | null;
}

export interface OrderItemPayload {
  product_id: string;
  product_name: string;
  product_image?: string;
  category_id?: string;
  quantity: number;
  unit_price: number;
  observations?: string;
  product_options: Array<{ group_id: string; option_id: string; name: string; price_delta: number }>;
  /** Ingredientes que o cliente pediu para tirar (o banco confere se podem ser retirados). */
  removed_ingredients?: string[];
}

export interface CreateOrderPayload {
  customer: CustomerInput;
  delivery_type: DeliveryType;
  address?: AddressInput | null;
  address_id?: string | null;
  save_address?: boolean;
  payment_method: PaymentMethodId;
  change_for?: number | null;
  coupon_code?: string | null;
  scheduled_for?: string | null;
  notes?: string | null;
  items: OrderItemPayload[];
  product_ids: string[];
  category_ids: string[];
}

export interface CreatedOrder {
  id: string;
  number: number;
  tracking_token: string;
  total: number;
  eta_minutes: number;
  status: OrderStatusId;
}

export interface OrderItemRecord {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  observations: string | null;
  product_options: Array<{ name: string; price_delta: number }>;
}

export interface OrderRecord {
  id: string;
  number: number;
  status: OrderStatusId;
  delivery_type: DeliveryType;
  payment_method: PaymentMethodId;
  payment_status: PaymentStatusId;
  change_for: number | null;
  address: AddressInput | null;
  customer: CustomerInput;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  eta_minutes: number;
  scheduled_for: string | null;
  notes: string | null;
  created_at: string;
  items: OrderItemRecord[];
  events: Array<{ status: OrderStatusId; created_at: string }>;
}

/** Formata o número sequencial no padrão #000125 */
export function formatOrderNumber(n: number) {
  return `#${String(n).padStart(6, "0")}`;
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodId, string> = {
  pix: "PIX",
  card_on_delivery: "Cartão na entrega",
  cash: "Dinheiro",
  online_card: "Cartão online",
};
