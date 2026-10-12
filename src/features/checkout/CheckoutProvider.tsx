import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCart, lineUnitPrice } from "@/features/cart/CartProvider";
import { REMOVE_GROUP_ID } from "@/features/menu/ingredients";
import { menuQueryOptions } from "@/features/menu/useMenu";
import { useAuth } from "@/hooks/useAuth";
import { OrderService } from "@/services/OrderService";
import { onlyDigits } from "./schemas";
import { useCoupons } from "./hooks/useCoupons";
import { useDelivery, useStoreStatus } from "./hooks/useDelivery";
import { useOrderSummary, type OrderSummary } from "./hooks/useOrderSummary";
import type {
  AddressInput,
  CreatedOrder,
  CustomerInput,
  DeliveryAreaResult,
  DeliveryType,
  OrderItemPayload,
  PaymentMethodId,
  StoreStatus,
} from "./types";

export const CHECKOUT_STEPS = ["Identificação", "Entrega", "Pagamento", "Confirmar"] as const;
export type CheckoutStepIndex = 0 | 1 | 2 | 3;

interface PaymentState {
  method: PaymentMethodId | null;
  needsChange: boolean;
  changeFor: string;
  notes: string;
}

interface CheckoutContextValue {
  step: CheckoutStepIndex;
  goTo: (step: CheckoutStepIndex) => void;
  next: () => void;
  back: () => void;
  maxStepReached: CheckoutStepIndex;

  customer: CustomerInput | null;
  setCustomer: (customer: CustomerInput) => void;
  isGuest: boolean;
  isAuthenticated: boolean;

  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  address: AddressInput | null;
  setAddress: (address: AddressInput | null) => void;
  addressId: string | null;
  setAddressId: (id: string | null) => void;
  saveAddress: boolean;
  setSaveAddress: (value: boolean) => void;
  area: DeliveryAreaResult | undefined;
  isCheckingArea: boolean;

  payment: PaymentState;
  setPayment: (patch: Partial<PaymentState>) => void;

  scheduledFor: string | null;
  setScheduledFor: (value: string | null) => void;
  storeStatus: StoreStatus | undefined;

  couponCode: string;
  setCouponCode: (code: string) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isApplyingCoupon: boolean;
  appliedCoupon: ReturnType<typeof useCoupons>["coupon"];

  summary: OrderSummary;
  items: ReturnType<typeof useCart>["items"];
  isEmpty: boolean;

  submit: () => void;
  isSubmitting: boolean;
  createdOrder: CreatedOrder | null;
  canSubmit: boolean;
  blockingReason: string | null;
}

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /** Categoria (slug) do produto, lida do cardápio já carregado em cache. */
  const categoryOf = React.useCallback(
    (productId: string) =>
      queryClient
        .getQueryData(menuQueryOptions.queryKey)
        ?.products.find((p) => p.id === productId)?.categoryId,
    [queryClient],
  );
  const { isAuthenticated } = useAuth();

  const [step, setStep] = React.useState<CheckoutStepIndex>(0);
  const [maxStepReached, setMaxStep] = React.useState<CheckoutStepIndex>(0);
  const [customer, setCustomerState] = React.useState<CustomerInput | null>(null);
  const [deliveryType, setDeliveryType] = React.useState<DeliveryType>("delivery");
  const [address, setAddress] = React.useState<AddressInput | null>(null);
  const [addressId, setAddressId] = React.useState<string | null>(null);
  const [saveAddress, setSaveAddress] = React.useState(true);
  const [scheduledFor, setScheduledFor] = React.useState<string | null>(null);
  const [couponCode, setCouponCode] = React.useState(cart.coupon?.code ?? "");
  const [createdOrder, setCreatedOrder] = React.useState<CreatedOrder | null>(null);
  const [payment, setPaymentState] = React.useState<PaymentState>({
    method: null,
    needsChange: false,
    changeFor: "",
    notes: "",
  });

  const { data: storeStatus } = useStoreStatus();
  const { area, isChecking } = useDelivery(
    deliveryType === "delivery" ? address?.district : undefined,
    address?.city,
  );

  const productIds = React.useMemo(() => cart.items.map((i) => i.productId), [cart.items]);
  const categoryIds = React.useMemo(
    () => Array.from(new Set(cart.items.map((i) => categoryOf(i.productId)).filter(Boolean))) as string[],
    [cart.items, categoryOf],
  );

  const baseFee = deliveryType === "delivery" && area?.available ? (area.fee ?? 0) : 0;
  const { coupon, discount, apply, remove, isApplying } = useCoupons({
    subtotal: cart.subtotal,
    deliveryFee: baseFee,
    categoryIds,
    productIds,
  });

  const summary = useOrderSummary({
    subtotal: cart.subtotal,
    deliveryType,
    area: deliveryType === "delivery" ? area : undefined,
    discount,
  });

  const setCustomer = React.useCallback((value: CustomerInput) => setCustomerState(value), []);
  const setPayment = React.useCallback(
    (patch: Partial<PaymentState>) => setPaymentState((prev) => ({ ...prev, ...patch })),
    [],
  );

  const goTo = React.useCallback((target: CheckoutStepIndex) => {
    setStep(target);
    setMaxStep((prev) => (target > prev ? target : prev));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const next = React.useCallback(
    () => goTo(Math.min(3, step + 1) as CheckoutStepIndex),
    [goTo, step],
  );
  const back = React.useCallback(
    () => goTo(Math.max(0, step - 1) as CheckoutStepIndex),
    [goTo, step],
  );

  const blockingReason = React.useMemo(() => {
    if (cart.items.length === 0) return "Seu carrinho está vazio.";
    if (!customer) return "Informe seus dados de contato.";
    if (deliveryType === "delivery") {
      if (!address) return "Informe o endereço de entrega.";
      if (area && !area.available) return area.reason ?? "Não entregamos neste bairro.";
      if (summary.belowMinimum)
        return `Pedido mínimo para este bairro: R$ ${summary.minOrderTotal.toFixed(2).replace(".", ",")}`;
    }
    if (!payment.method) return "Selecione uma forma de pagamento.";
    if (storeStatus && !storeStatus.open && !scheduledFor)
      return "Estamos fechados. Agende seu pedido para continuar.";
    return null;
  }, [cart.items.length, customer, deliveryType, address, area, summary, payment.method, storeStatus, scheduledFor]);

  const mutation = useMutation({
    mutationFn: async () => {
      const items: OrderItemPayload[] = cart.items.map((item) => ({
        product_id: item.productId,
        product_name: item.name,
        product_image: item.image,
        category_id: categoryOf(item.productId),
        quantity: item.quantity,
        unit_price: lineUnitPrice(item),
        observations: item.notes,
        product_options: item.options
          .filter((o) => o.groupId !== REMOVE_GROUP_ID)
          .map((o) => ({
            group_id: o.groupId,
            option_id: o.optionId,
            name: o.name,
            price_delta: o.priceDelta,
          })),
        removed_ingredients: item.options
          .filter((o) => o.groupId === REMOVE_GROUP_ID)
          .map((o) => o.name.replace(/^Sem /, "")),
      }));

      return OrderService.create({
        customer: {
          name: customer!.name,
          phone: onlyDigits(customer!.phone),
          email: customer?.email || undefined,
        },
        delivery_type: deliveryType,
        address: deliveryType === "delivery" ? address : null,
        address_id: addressId,
        save_address: deliveryType === "delivery" && isAuthenticated && saveAddress && !addressId,
        payment_method: payment.method!,
        change_for:
          payment.method === "cash" && payment.needsChange
            ? Number(payment.changeFor.replace(",", "."))
            : null,
        coupon_code: coupon?.code ?? null,
        scheduled_for: scheduledFor,
        notes: payment.notes || null,
        items,
        product_ids: productIds,
        category_ids: categoryIds,
      });
    },
    onSuccess: (order) => {
      setCreatedOrder(order);
      cart.clear();
      toast.success("Pedido criado com sucesso!");
      void navigate({ to: "/pedido/$token", params: { token: order.tracking_token } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const value: CheckoutContextValue = {
    step,
    goTo,
    next,
    back,
    maxStepReached,
    customer,
    setCustomer,
    isGuest: !isAuthenticated,
    isAuthenticated,
    deliveryType,
    setDeliveryType,
    address,
    setAddress,
    addressId,
    setAddressId,
    saveAddress,
    setSaveAddress,
    area: deliveryType === "delivery" ? area : undefined,
    isCheckingArea: isChecking,
    payment,
    setPayment,
    scheduledFor,
    setScheduledFor,
    storeStatus,
    couponCode,
    setCouponCode,
    applyCoupon: apply,
    removeCoupon: remove,
    isApplyingCoupon: isApplying,
    appliedCoupon: coupon,
    summary,
    items: cart.items,
    isEmpty: cart.items.length === 0,
    submit: () => mutation.mutate(),
    isSubmitting: mutation.isPending,
    createdOrder,
    canSubmit: blockingReason === null && !mutation.isPending,
    blockingReason,
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = React.useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout deve ser usado dentro de <CheckoutProvider>");
  return ctx;
}
