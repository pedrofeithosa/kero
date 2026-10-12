import * as React from "react";
import { Heart, Plus } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTag, RatingStars } from "@/components/ui/price-tag";
import { Skeleton } from "@/components/ui/skeleton";

export interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  compareAt?: number;
  image?: string;
  rating?: number;
  ratingCount?: number;
  isNew?: boolean;
  promoLabel?: string;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  onAdd?: () => void;
  className?: string;
}

/** Kero Mais — Product Card (componente principal do cardápio) */
export function ProductCard({
  name,
  description,
  price,
  compareAt,
  image,
  rating,
  ratingCount,
  isNew,
  promoLabel,
  favorite,
  onToggleFavorite,
  onAdd,
  className,
}: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-shadow hover:shadow-hover",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-linear-to-br from-muted to-border" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {promoLabel ? <Badge variant="promo">{promoLabel}</Badge> : null}
          {isNew ? <Badge variant="new">Novo</Badge> : null}
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={favorite ? `Remover ${name} dos favoritos` : `Favoritar ${name}`}
          aria-pressed={favorite ?? false}
          className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft backdrop-blur transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className={cn("size-5", favorite && "fill-primary text-primary")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="font-display text-h5 font-bold leading-tight">{name}</h3>
          <p className="line-clamp-2 text-small text-muted-foreground">{description}</p>
        </div>
        {rating != null ? <RatingStars value={rating} count={ratingCount} /> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <PriceTag price={price} compareAt={compareAt} />
          <Button size="icon" onClick={onAdd} aria-label={`Adicionar ${name} ao carrinho`}>
            <Plus />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

/** Skeleton correspondente ao Product Card */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="size-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}
