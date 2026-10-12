import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

/** Kero Mais — Botão de favorito acessível */
export function FavoriteButton({ active, onToggle, label, className }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={active ? `Remover ${label} dos favoritos` : `Favoritar ${label}`}
      aria-pressed={active}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft backdrop-blur transition-all duration-200 hover:scale-110 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Heart className={cn("size-5", active && "fill-primary text-primary")} />
    </button>
  );
}
