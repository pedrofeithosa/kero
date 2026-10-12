import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, Ticket, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { formatPrice } from "@/components/ui/price-tag";
import { Badge } from "@/components/ui/badge";
import { PriceSummary } from "./PriceSummary";
import { useCart, lineUnitPrice, lineTotal, FREE_DELIVERY_FROM } from "@/features/cart/CartProvider";
import { useIsMobile } from "@/hooks/use-mobile";

/** Kero Mais — Drawer do carrinho (lateral no desktop, inferior no mobile) */
export function CartDrawer() {
  const cart = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [couponInput, setCouponInput] = React.useState("");

  const finish = () => {
    if (cart.items.length === 0) return;
    cart.closeCart();
    void navigate({ to: "/checkout" });
  };

  const missingForFreeDelivery = Math.max(0, FREE_DELIVERY_FROM - cart.subtotal);

  return (
    <Sheet open={cart.isOpen} onOpenChange={cart.setOpen}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md md:w-[26rem] [&>button]:hidden"
        aria-describedby="cart-description"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <SheetTitle className="flex items-center gap-2 font-display text-h5 font-extrabold">
              <ShoppingBag className="size-5 text-primary" /> Seu carrinho
              {cart.count > 0 ? <Badge variant="default">{cart.count}</Badge> : null}
            </SheetTitle>
            <SheetDescription id="cart-description" className="text-caption">
              Revise os itens antes de finalizar.
            </SheetDescription>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Fechar carrinho" onClick={cart.closeCart}>
            <X />
          </Button>
        </header>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-14 text-center">
            <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="size-7" />
            </div>
            <div>
              <h3 className="font-display text-h5 font-bold">Seu carrinho está vazio</h3>
              <p className="mt-1 text-small text-muted-foreground">
                Escolha seus favoritos no cardápio e monte seu pedido em poucos cliques.
              </p>
            </div>
            <Button onClick={cart.closeCart}>Ver cardápio</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                <AnimatePresence initial={false}>
                  {cart.items.map((item) => (
                    <motion.li
                      key={item.lineId}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="flex gap-3 rounded-card border border-border bg-card p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="size-20 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="truncate font-display text-small font-bold">{item.name}</h4>
                          <button
                            type="button"
                            onClick={() => cart.removeItem(item.lineId)}
                            aria-label={`Remover ${item.name} do carrinho`}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        {item.options.length > 0 ? (
                          <p className="line-clamp-2 text-caption text-muted-foreground">
                            {item.options.map((o) => o.name).join(" • ")}
                          </p>
                        ) : null}
                        {item.notes ? (
                          <p className="line-clamp-1 text-caption italic text-muted-foreground">
                            “{item.notes}”
                          </p>
                        ) : null}
                        <p className="text-caption text-muted-foreground">
                          {formatPrice(lineUnitPrice(item))} / un.
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <QuantitySelector
                            size="sm"
                            value={item.quantity}
                            min={1}
                            max={20}
                            onChange={(q) => cart.updateQuantity(item.lineId, q)}
                            label={`Quantidade de ${item.name}`}
                          />
                          <span className="font-display text-small font-extrabold">
                            {formatPrice(lineTotal(item))}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {missingForFreeDelivery > 0 ? (
                <p className="mt-4 rounded-button bg-highlight/15 px-4 py-3 text-caption font-semibold text-foreground">
                  Faltam {formatPrice(missingForFreeDelivery)} para ganhar entrega grátis.
                </p>
              ) : null}
            </div>

            <footer className="space-y-4 border-t border-border bg-card px-5 py-4">
              {cart.coupon ? (
                <div className="flex items-center justify-between gap-2 rounded-button border border-success/40 bg-success/10 px-3 py-2">
                  <span className="flex items-center gap-2 text-small font-semibold">
                    <Ticket className="size-4" /> {cart.coupon.code}
                  </span>
                  <Button variant="ghost" size="sm" onClick={cart.removeCoupon}>
                    Remover
                  </Button>
                </div>
              ) : (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (cart.applyCoupon(couponInput)) setCouponInput("");
                  }}
                >
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Cupom de desconto"
                    aria-label="Cupom de desconto"
                    maxLength={20}
                  />
                  <Button type="submit" variant="outline" disabled={!couponInput.trim()}>
                    Aplicar
                  </Button>
                </form>
              )}

              <PriceSummary
                subtotal={cart.subtotal}
                deliveryFee={cart.deliveryFee}
                discount={cart.discount}
                total={cart.total}
                couponCode={cart.coupon?.code}
              />

              <Button size="lg" full onClick={finish} disabled={cart.items.length === 0}>
                Finalizar Pedido
              </Button>
            </footer>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
