import { Chip } from "@/components/ui/chip";
import type { MenuCategory, MenuFilterId } from "@/features/menu/types";

interface CategoryFilterProps {
  categories: MenuCategory[];
  value: MenuFilterId;
  onChange: (value: MenuFilterId) => void;
  counts?: Partial<Record<MenuFilterId, number>>;
}

/** Kero Mais — Filtros em chips com scroll horizontal no mobile */
export function CategoryFilter({ categories, value, onChange, counts }: CategoryFilterProps) {
  const items: { id: MenuFilterId; label: string }[] = [
    { id: "all", label: "Todos" },
    ...categories
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ id: c.id as MenuFilterId, label: c.name })),
    { id: "promos", label: "Promoções" },
    { id: "new", label: "Novidades" },
    { id: "best-sellers", label: "Mais vendidos" },
  ];

  return (
    <div
      role="group"
      aria-label="Filtrar cardápio por categoria"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
    >
      {items.map((item) => (
        <Chip
          key={item.id}
          active={value === item.id}
          onClick={() => onChange(item.id)}
          className="shrink-0"
        >
          {item.label}
          {counts?.[item.id] != null ? (
            <span className="text-caption opacity-70">{counts[item.id]}</span>
          ) : null}
        </Chip>
      ))}
    </div>
  );
}
