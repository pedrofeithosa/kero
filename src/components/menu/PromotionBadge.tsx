import { Badge } from "@/components/ui/badge";
import type { MenuProduct } from "@/features/menu/types";

/** Kero Mais — Badges de promoção/novidade/mais vendido/esgotado */
export function PromotionBadge({ product }: { product: MenuProduct }) {
  return (
    <div className="flex flex-wrap gap-2">
      {product.availability === "sold_out" ? <Badge variant="muted">Esgotado</Badge> : null}
      {product.availability === "unavailable" ? (
        <Badge variant="outline">Indisponível</Badge>
      ) : null}
      {product.isPromo ? <Badge variant="promo">Promoção</Badge> : null}
      {product.isBestSeller ? <Badge variant="default">Mais vendido</Badge> : null}
      {product.isNew ? <Badge variant="new">Novo</Badge> : null}
    </div>
  );
}
