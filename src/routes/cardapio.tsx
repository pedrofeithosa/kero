import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { MenuBanner } from "@/components/menu/MenuBanner";
import { SearchBar } from "@/components/menu/SearchBar";
import { CategoryFilter } from "@/components/menu/CategoryFilter";
import { SortSelect } from "@/components/menu/SortSelect";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { CustomizationModal } from "@/components/menu/CustomizationModal";
import { FloatingCart } from "@/components/cart/FloatingCart";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/CartProvider";
import { useFavorites } from "@/features/menu/useFavorites";
import { menuQueryOptions, useMenuCatalog, useMenuResults } from "@/features/menu/useMenu";
import type { MenuFilterId, MenuProduct, SortId } from "@/features/menu/types";

const SORTS: SortId[] = ["best-sellers", "price-asc", "price-desc", "newest", "alpha"];

type MenuSearch = { q?: string; cat?: MenuFilterId; sort?: SortId };

export const Route = createFileRoute("/cardapio")({
  validateSearch: (search: MenuSearch): MenuSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    cat: typeof search.cat === "string" && search.cat.length > 0 && search.cat.length < 60 ? (search.cat as MenuFilterId) : "all",
    sort: SORTS.includes(search.sort as SortId) ? (search.sort as SortId) : "best-sellers",
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(menuQueryOptions);
  },
  head: () => ({
    meta: [
      { title: "Cardápio — Kero Mais" },
      {
        name: "description",
        content:
          "Hambúrgueres artesanais, hot dogs, combos, bebidas e sobremesas. Monte seu pedido em poucos cliques na Kero Mais.",
      },
      { property: "og:title", content: "Cardápio — Kero Mais" },
      {
        property: "og:description",
        content: "Escolha seus favoritos e monte seu pedido com entrega rápida.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <PublicShell>
      <div className="container-page py-20" role="alert">
        <EmptyState title="Não foi possível carregar o cardápio" description={error instanceof Error ? error.message : "Tente novamente."} />
      </div>
    </PublicShell>
  ),
  notFoundComponent: () => (
    <PublicShell>
      <div className="container-page py-20">
        <EmptyState title="Cardápio indisponível" />
      </div>
    </PublicShell>
  ),
  component: CardapioPage,
});

function CardapioPage() {
  return (
    <PublicShell>
      <MenuBanner />
      <React.Suspense
        fallback={<div className="container-page py-16 text-muted-foreground">Carregando cardápio…</div>}
      >
        <MenuContent />
      </React.Suspense>
      <FloatingCart />
    </PublicShell>
  );
}

function MenuContent() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const cat: MenuFilterId = search.cat ?? "all";
  const sort: SortId = search.sort ?? "best-sellers";
  const navigate = useNavigate({ from: Route.fullPath });
  const { categories } = useMenuCatalog();
  const { isFavorite, toggleFavorite } = useFavorites();
  const cart = useCart();

  const [selected, setSelected] = React.useState<MenuProduct | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const setSearch = React.useCallback(
    (patch: Partial<{ q: string; cat: MenuFilterId; sort: SortId }>) => {
      void navigate({ to: ".", search: { q, cat, sort, ...patch }, replace: true });
    },
    [navigate, q, cat, sort],
  );

  const { sections, total } = useMenuResults({
    search: q,
    filter: cat,
    sort,
    hideUnavailable: false,
  });

  const openProduct = (product: MenuProduct) => {
    setSelected(product);
    setModalOpen(true);
  };

  return (
    <div className="container-page space-y-8 py-10 pb-28 md:py-14">
      <div className="sticky top-16 z-30 -mx-4 space-y-4 bg-background/95 px-4 py-4 backdrop-blur md:top-18 md:mx-0 md:rounded-card md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={q} onChange={(v) => setSearch({ q: v })} resultCount={total} />
          <SortSelect value={sort} onChange={(v) => setSearch({ sort: v })} />
        </div>
        <CategoryFilter
          categories={categories}
          value={cat}
          onChange={(v) => setSearch({ cat: v })}
        />
      </div>

      <p className="text-small text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? "produto encontrado" : "produtos encontrados"}
      </p>

      {sections.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-6 w-6" />}
          title="Nenhum produto encontrado"
          description="Tente outra palavra-chave ou remova os filtros aplicados."
          action={
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearch({ q: "", cat: "all" })}
            >
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-14">
          {sections.map((section) => (
            <section key={section.category.id} aria-labelledby={`cat-${section.category.id}`}>
              <header className="mb-5">
                <h2
                  id={`cat-${section.category.id}`}
                  className="font-display text-h3 font-extrabold"
                >
                  {section.category.name}
                </h2>
                <p className="mt-1 text-small text-muted-foreground">
                  {section.category.description}
                </p>
              </header>
              <ProductGrid
                products={section.products}
                isFavorite={isFavorite}
                onToggleFavorite={(p) => toggleFavorite(p.id, p.name)}
                onAdd={openProduct}
              />
            </section>
          ))}
        </div>
      )}

      <CustomizationModal
        product={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={({ product, options, notes, quantity }) => {
          cart.addItem({ product, options, notes, quantity });
          setModalOpen(false);
          cart.openCart();
        }}
      />
    </div>
  );
}
