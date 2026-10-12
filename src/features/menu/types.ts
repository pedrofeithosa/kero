/** Kero Mais — Tipos do módulo Cardápio (prontos para mapear o schema Supabase). */

/** Slug da categoria. Vem do banco (criado em /admin/categorias), então não é uma lista fixa. */
export type MenuCategoryId = string;

export interface MenuCategory {
  id: MenuCategoryId;
  name: string;
  description: string;
  position: number;
  /** Imagem cadastrada no admin (já resolvida para URL). Vazio = a Home usa uma imagem padrão. */
  image?: string;
}

export type OptionGroupType = "single" | "multiple";

export interface MenuOption {
  id: string;
  name: string;
  priceDelta: number;
  available?: boolean;
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  description?: string;
  type: OptionGroupType;
  required?: boolean;
  min?: number;
  max?: number;
  options: MenuOption[];
}

export type ProductAvailability = "available" | "sold_out" | "unavailable";

export interface MenuProduct {
  id: string;
  slug: string;
  categoryId: MenuCategoryId;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  compareAt?: number;
  image: string;
  rating?: number;
  ratingCount?: number;
  prepTimeMinutes?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  isPromo?: boolean;
  availability: ProductAvailability;
  createdAt: string;
  soldCount: number;
  optionGroups: MenuOptionGroup[];
}

export type MenuFilterId =
  | "all"
  | MenuCategoryId
  | "promos"
  | "new"
  | "best-sellers";

export type SortId = "best-sellers" | "price-asc" | "price-desc" | "newest" | "alpha";

export interface SelectedOption {
  groupId: string;
  optionId: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  /** id único da linha do carrinho (produto + combinação de opções) */
  lineId: string;
  productId: string;
  name: string;
  image: string;
  unitBasePrice: number;
  options: SelectedOption[];
  notes?: string;
  quantity: number;
}
