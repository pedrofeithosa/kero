import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { catalogImageUrl } from "@/lib/storage";
import { buildRemoveGroup, parseIngredients } from "./ingredients";
import type {
  MenuCategory,
  MenuFilterId,
  MenuOptionGroup,
  MenuProduct,
  ProductAvailability,
  SortId,
} from "./types";

type OptionRow = Tables<"product_options">;
type GroupRow = Tables<"product_option_groups"> & { product_options: OptionRow[] | null };
type ProductRow = Tables<"products"> & { product_option_groups: GroupRow[] | null };

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

function toOptionGroup(g: GroupRow): MenuOptionGroup {
  return {
    id: g.id,
    name: g.name,
    description: g.description ?? undefined,
    type: g.type === "single" ? "single" : "multiple",
    required: g.required,
    min: g.min_select > 0 ? g.min_select : undefined,
    max: g.max_select ?? undefined,
    options: (g.product_options ?? [])
      .filter((o) => o.is_active)
      .sort(byPosition)
      .map((o) => ({ id: o.id, name: o.name, priceDelta: Number(o.price_delta) })),
  };
}

/**
 * Cardápio vindo do Supabase (tabelas categories / products / product_option_groups /
 * product_options). É o que o painel admin edita, então preço e disponibilidade
 * mudados lá aparecem aqui. A venda em si é sempre revalidada pelo banco (create_order).
 */
export const menuQueryOptions = queryOptions({
  queryKey: ["menu", "catalog"],
  queryFn: async (): Promise<{ categories: MenuCategory[]; products: MenuProduct[] }> => {
    const [catRes, prodRes, sharedRes] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .is("archived_at", null)
        .order("position"),
      supabase
        .from("products")
        .select("*, product_option_groups(*, product_options(*))")
        .eq("is_active", true)
        .is("archived_at", null)
        .order("position"),
      supabase
        .from("product_option_groups")
        .select("*, product_options(*)")
        .eq("is_shared", true)
        .eq("is_active", true)
        .order("position"),
    ]);
    if (sharedRes.error) throw new Error(sharedRes.error.message);
    if (catRes.error) throw new Error(catRes.error.message);
    if (prodRes.error) throw new Error(prodRes.error.message);

    const categories: MenuCategory[] = (catRes.data ?? []).map((c) => ({
      id: c.slug,
      name: c.name,
      description: c.description ?? "",
      position: c.position,
      image: c.image_url ? catalogImageUrl(c.image_url) : undefined,
    }));
    const slugById = new Map((catRes.data ?? []).map((c) => [c.id, c.slug]));
    // Grupos compartilhados (admin → Adicionais): valem para as categorias escolhidas; lista vazia = todas.
    const shared = (sharedRes.data as unknown as GroupRow[]).map((g) => ({
      categoryIds: g.category_ids ?? [],
      group: toOptionGroup(g),
    }));

    const products: MenuProduct[] = (prodRes.data as unknown as ProductRow[])
      .filter((p) => p.category_id && slugById.has(p.category_id))
      .map((p) => {
      const parsed = parseIngredients(p.ingredients);
      const removeGroup = buildRemoveGroup(parsed);
      return {
        id: p.id,
        slug: p.slug,
        categoryId: slugById.get(p.category_id!)!,
        name: p.name,
        description: p.description,
        ingredients: parsed.map((i) => i.name),
        price: Number(p.price),
        compareAt: p.compare_at != null ? Number(p.compare_at) : undefined,
        image: catalogImageUrl(p.image_url),
        prepTimeMinutes: p.prep_time_minutes,
        isBestSeller: p.is_best_seller,
        isNew: p.is_new,
        isPromo: p.compare_at != null && Number(p.compare_at) > Number(p.price),
        availability: (["available", "sold_out", "unavailable"].includes(p.availability)
          ? p.availability
          : "available") as ProductAvailability,
        createdAt: p.created_at,
        soldCount: p.sold_count,
        optionGroups: [
          // Os grupos "Retirar ingredientes" antigos (fixos, vindos do Lovable) são ignorados:
          // agora a lista sai do campo Ingredientes do produto.
          ...(p.product_option_groups ?? [])
            .filter((g) => g.is_active && !/^\s*retirar ingredientes\s*$/i.test(g.name))
            .sort(byPosition)
            .map(toOptionGroup),
          ...(removeGroup ? [removeGroup] : []),
          ...shared
            .filter((s) => s.categoryIds.length === 0 || s.categoryIds.includes(p.category_id!))
            .map((s) => s.group)
            .filter((g) => g.options.length > 0),
        ],
      };
      });

    return { categories, products };
  },
  staleTime: 60_000,
});

export function useMenuCatalog() {
  return useSuspenseQuery(menuQueryOptions).data;
}

export function useCategories() {
  return useMenuCatalog().categories;
}

export function useProducts() {
  return useMenuCatalog().products;
}

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "best-sellers", label: "Mais vendidos" },
  { id: "price-asc", label: "Menor preço" },
  { id: "price-desc", label: "Maior preço" },
  { id: "newest", label: "Mais recentes" },
  { id: "alpha", label: "Ordem alfabética" },
];

const normalize = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Busca por nome, descrição, ingredientes e categoria. */
export function searchProducts(
  products: MenuProduct[],
  term: string,
  categories: MenuCategory[],
) {
  const q = normalize(term.trim());
  if (!q) return products;
  const categoryName = new Map(categories.map((c) => [c.id, normalize(c.name)]));
  return products.filter((p) => {
    const haystack = [
      p.name,
      p.description,
      ...p.ingredients,
    ]
      .map(normalize)
      .concat(categoryName.get(p.categoryId) ?? "");
    return haystack.some((h) => h.includes(q));
  });
}

export function filterProducts(products: MenuProduct[], filter: MenuFilterId) {
  switch (filter) {
    case "all":
      return products;
    case "promos":
      return products.filter((p) => p.isPromo);
    case "new":
      return products.filter((p) => p.isNew);
    case "best-sellers":
      return products.filter((p) => p.isBestSeller);
    default:
      return products.filter((p) => p.categoryId === filter);
  }
}

export function sortProducts(products: MenuProduct[], sort: SortId) {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "alpha":
      return list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    case "best-sellers":
    default:
      return list.sort((a, b) => b.soldCount - a.soldCount);
  }
}

export interface MenuSection {
  category: MenuCategory;
  products: MenuProduct[];
}

/** Aplica busca + filtro + ordenação e agrupa por categoria. */
export function useMenuResults({
  search,
  filter,
  sort,
  hideUnavailable,
}: {
  search: string;
  filter: MenuFilterId;
  sort: SortId;
  hideUnavailable?: boolean;
}) {
  const { categories, products } = useMenuCatalog();

  return React.useMemo(() => {
    let list = hideUnavailable
      ? products.filter((p) => p.availability !== "unavailable")
      : products;
    list = searchProducts(list, search, categories);
    list = filterProducts(list, filter);
    list = sortProducts(list, sort);

    const sections: MenuSection[] = categories
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((category) => ({
        category,
        products: list.filter((p) => p.categoryId === category.id),
      }))
      .filter((s) => s.products.length > 0);

    return { sections, total: list.length };
  }, [categories, products, search, filter, sort, hideUnavailable]);
}
