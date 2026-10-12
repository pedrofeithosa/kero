import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/components/ui/price-tag";
import { useCart } from "@/features/cart/CartProvider";

/** Kero Mais — Carrinho flutuante (mobile-first, sempre visível com itens) */
export function FloatingCart() {
  const { count, total, openCart } = useCart();

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-4 bottom-4 z-40 md:inset-x-auto md:bottom-6 md:right-24"
        >
          <button
            type="button"
            onClick={openCart}
            className="flex w-full items-center justify-between gap-4 rounded-button bg-primary px-5 py-4 text-primary-foreground shadow-float transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto"
          >
            <span className="flex items-center gap-2 font-display font-bold">
              <ShoppingBag className="size-5" />
              Ver carrinho
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-caption">
                {count}
              </span>
            </span>
            <span className="font-display text-h6 font-extrabold">{formatPrice(total)}</span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
