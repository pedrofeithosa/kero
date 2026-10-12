import { Clock, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { PriceTag, RatingStars } from "@/components/ui/price-tag";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "./FavoriteButton";
import { PromotionBadge } from "./PromotionBadge";
import { cn } from "@/lib/utils";
import type { MenuProduct } from "@/features/menu/types";

interface MenuProductCardProps {
  product: MenuProduct;
  favorite: boolean;
  onToggleFavorite: () => void;
  onAdd: () => void;
  className?: string;
}

/** Kero Mais — Card de produto do cardápio */
export function MenuProductCard({
  product,
  favorite,
  onToggleFavorite,
  onAdd,
  className,
}: MenuProductCardProps) {
  const disabled = product.availability !== "available";

  return (
    <motion.article
      whileHover={disabled ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-shadow hover:shadow-hover",
        disabled && "opacity-70",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={cn(
            "size-full object-cover transition-transform duration-500 ease-out",
            !disabled && "group-hover:scale-110",
            disabled && "grayscale",
          )}
        />
        <div className="absolute left-3 top-3">
          <PromotionBadge product={product} />
        </div>
        <FavoriteButton
          active={favorite}
          onToggle={onToggleFavorite}
          label={product.name}
          className="absolute right-3 top-3"
        />
        {product.prepTimeMinutes ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-caption font-semibold text-foreground backdrop-blur">
            <Clock className="size-3.5" /> {product.prepTimeMinutes} min
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="font-display text-h5 font-bold leading-tight">{product.name}</h3>
          <p className="line-clamp-2 text-small text-muted-foreground">{product.description}</p>
        </div>
        {product.rating != null ? (
          <RatingStars value={product.rating} count={product.ratingCount} />
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <PriceTag price={product.price} compareAt={product.compareAt} />
          <Button
            onClick={onAdd}
            disabled={disabled}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            className="gap-1"
          >
            <Plus />
            <span className="hidden sm:inline">
              {disabled ? "Indisponível" : "Adicionar"}
            </span>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function MenuProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-11 w-28 rounded-button" />
        </div>
      </div>
    </div>
  );
}
