import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  label: string;
  count?: number;
  icon?: LucideIcon;
  image?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Kero Mais — Category Card */
export function CategoryCard({
  label,
  count,
  icon: Icon,
  image,
  active,
  onClick,
  className,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ?? false}
      className={cn(
        "group relative flex min-h-28 flex-col items-start justify-end overflow-hidden rounded-card border p-4 text-left transition-all duration-300 hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        className,
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      {image ? <span className="absolute inset-0 bg-linear-to-t from-secondary/85 to-secondary/10" /> : null}
      <span className={cn("relative flex flex-col gap-1", image && "text-secondary-foreground")}>
        {Icon ? <Icon className="size-6" /> : null}
        <span className="font-display text-h5 font-bold">{label}</span>
        {count != null ? (
          <span className="text-caption font-semibold opacity-70">{count} itens</span>
        ) : null}
      </span>
    </button>
  );
}
