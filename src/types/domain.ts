/**
 * Kero Mais — Tipos de domínio
 *
 * Modelagem inicial. Refletirá o schema Supabase quando as tabelas forem criadas.
 * Nenhuma implementação aqui — apenas contratos.
 */

export type UUID = string;
export type ISODate = string;

export type UserRole = "admin" | "kitchen" | "customer";

export interface UserRoleRow {
  id: UUID;
  user_id: UUID;
  role: UserRole;
}

export interface Customer {
  id: UUID;
  user_id: UUID | null;
  name: string;
  phone: string;
  email?: string | null;
  created_at: ISODate;
}

export interface Address {
  id: UUID;
  customer_id: UUID;
  label?: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
}

export interface Category {
  id: UUID;
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  position: number;
  is_active: boolean;
}

export interface Product {
  id: UUID;
  category_id: UUID;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  base_price: number; // em centavos
  is_active: boolean;
  is_featured: boolean;
  prep_time_minutes?: number | null;
}

export interface ProductOptionGroup {
  id: UUID;
  product_id: UUID;
  name: string;
  min_select: number;
  max_select: number;
  required: boolean;
}

export interface ProductOption {
  id: UUID;
  group_id: UUID;
  name: string;
  price_delta: number; // em centavos
  is_active: boolean;
}

export type OrderChannel = "delivery" | "pickup";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  id: UUID;
  code: string;
  customer_id: UUID;
  channel: OrderChannel;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon_id?: UUID | null;
  address_id?: UUID | null;
  payment_method_id: UUID;
  notes?: string | null;
  created_at: ISODate;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  name_snapshot: string;
  unit_price: number;
  quantity: number;
  notes?: string | null;
}

export interface OrderItemOption {
  id: UUID;
  order_item_id: UUID;
  option_id: UUID;
  name_snapshot: string;
  price_delta: number;
}

export interface Coupon {
  id: UUID;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_total?: number | null;
  starts_at?: ISODate | null;
  ends_at?: ISODate | null;
  max_uses?: number | null;
  is_active: boolean;
}

export interface Promotion {
  id: UUID;
  title: string;
  description?: string | null;
  image_url?: string | null;
  starts_at?: ISODate | null;
  ends_at?: ISODate | null;
  is_active: boolean;
}

export interface DeliveryZone {
  id: UUID;
  name: string;
  fee: number;
  min_order_total: number;
  eta_minutes: number;
  is_active: boolean;
}

export interface PaymentMethod {
  id: UUID;
  name: string;
  kind: "cash" | "card_on_delivery" | "pix" | "online_card";
  is_active: boolean;
}

export interface CartItem {
  product_id: UUID;
  slug: string;
  name: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  options: Array<{ option_id: UUID; name: string; price_delta: number }>;
  notes?: string;
}
