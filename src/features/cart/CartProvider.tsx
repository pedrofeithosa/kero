import * as React from "react";
import { toast } from "sonner";
import type { CartItem, MenuProduct, SelectedOption } from "@/features/menu/types";

const STORAGE_KEY = "kero-mais:cart:v2";
const DELIVERY_FEE = 8.9;
const FREE_DELIVERY_FROM = 80;

export interface CouponState {
  code: string;
  discount: number;
}

const COUPONS: Record<string, { type: "percent" | "fixed"; value: number; min: number }> = {
  KERO10: { type: "percent", value: 10, min: 40 },
  BEMVINDO15: { type: "percent", value: 15, min: 60 },
  FRETE0: { type: "fixed", value: DELIVERY_FEE, min: 50 },
};

export interface AddToCartPayload {
  product: MenuProduct;
  options: SelectedOption[];
  notes?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon: CouponState | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
  addItem: (payload: AddToCartPayload) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function buildLineId(productId: string, options: SelectedOption[], notes?: string) {
  const optionKey = options
    .map((o) => `${o.groupId}:${o.optionId}`)
    .sort()
    .join("|");
  return `${productId}__${optionKey}__${(notes ?? "").trim().toLowerCase()}`;
}

export function lineUnitPrice(item: CartItem) {
  return item.unitBasePrice + item.options.reduce((sum, o) => sum + o.priceDelta, 0);
}

export function lineTotal(item: CartItem) {
  return lineUnitPrice(item) * item.quantity;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [coupon, setCoupon] = React.useState<CouponState | null>(null);
  const [isOpen, setOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  /* Persistência — visitante: LocalStorage. Usuário logado: migrar para Lovable Cloud. */
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: CartItem[]; coupon?: CouponState | null };
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.coupon) setCoupon(parsed.coupon);
      }
    } catch {
      /* storage indisponível */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, coupon }));
    } catch {
      /* storage indisponível */
    }
  }, [items, coupon, hydrated]);

  const addItem = React.useCallback(
    ({ product, options, notes, quantity }: AddToCartPayload) => {
      const qty = Math.max(1, Math.min(99, Math.round(quantity)));
      const lineId = buildLineId(product.id, options, notes);
      setItems((prev) => {
        const existing = prev.find((i) => i.lineId === lineId);
        if (existing) {
          return prev.map((i) =>
            i.lineId === lineId ? { ...i, quantity: Math.min(99, i.quantity + qty) } : i,
          );
        }
        return [
          ...prev,
          {
            lineId,
            productId: product.id,
            name: product.name,
            image: product.image,
            unitBasePrice: product.price,
            options,
            notes: notes?.trim() || undefined,
            quantity: qty,
          },
        ];
      });
      toast.success(`${product.name} adicionado ao carrinho`, {
        description: qty > 1 ? `${qty} unidades` : undefined,
      });
    },
    [],
  );

  const updateQuantity = React.useCallback((lineId: string, quantity: number) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.lineId !== lineId) return [i];
        const next = Math.round(quantity);
        if (next < 1) return [];
        return [{ ...i, quantity: Math.min(99, next) }];
      }),
    );
  }, []);

  const removeItem = React.useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
    toast.info("Item removido do carrinho");
  }, []);

  const clear = React.useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const subtotal = React.useMemo(() => items.reduce((s, i) => s + lineTotal(i), 0), [items]);
  const count = React.useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const deliveryFee = items.length === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;

  const discount = React.useMemo(() => {
    if (!coupon) return 0;
    return Math.min(coupon.discount, subtotal);
  }, [coupon, subtotal]);

  const applyCoupon = React.useCallback(
    (code: string) => {
      const key = code.trim().toUpperCase();
      const found = COUPONS[key];
      if (!found) {
        toast.error("Cupom inválido");
        return false;
      }
      if (subtotal < found.min) {
        toast.error(`Cupom válido a partir de R$ ${found.min.toFixed(2).replace(".", ",")}`);
        return false;
      }
      const value = found.type === "percent" ? (subtotal * found.value) / 100 : found.value;
      setCoupon({ code: key, discount: Number(value.toFixed(2)) });
      toast.success(`Cupom ${key} aplicado`);
      return true;
    },
    [subtotal],
  );

  const removeCoupon = React.useCallback(() => setCoupon(null), []);

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const value: CartContextValue = {
    items,
    hydrated,
    count,
    subtotal,
    deliveryFee,
    discount,
    total,
    coupon,
    isOpen,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    setOpen,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}

export { DELIVERY_FEE, FREE_DELIVERY_FROM };
