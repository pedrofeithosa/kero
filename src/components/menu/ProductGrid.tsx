import { motion } from "motion/react";
import { MenuProductCard } from "./MenuProductCard";
import type { MenuProduct } from "@/features/menu/types";

interface ProductGridProps {
  products: MenuProduct[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (product: MenuProduct) => void;
  onAdd: (product: MenuProduct) => void;
}

/** Kero Mais — Grid responsivo de produtos */
export function ProductGrid({
  products,
  isFavorite,
  onToggleFavorite,
  onAdd,
}: ProductGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04 }}
          className="h-full"
        >
          <MenuProductCard
            product={product}
            favorite={isFavorite(product.id)}
            onToggleFavorite={() => onToggleFavorite(product)}
            onAdd={() => onAdd(product)}
          />
        </motion.div>
      ))}
    </div>
  );
}
