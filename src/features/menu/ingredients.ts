import type { MenuOptionGroup } from "./types";

/** Id do grupo "Retirar ingredientes" gerado automaticamente a partir do campo Ingredientes do admin. */
export const REMOVE_GROUP_ID = "__remove__";

export interface ParsedIngredient {
  name: string;
  /** false quando o admin marcou com * (ex.: "pão brioche*"): aparece na lista, mas o cliente não pode tirar. */
  removable: boolean;
}

/** Lê o campo Ingredientes do admin ("pão*, blend, alface, tomate"). */
export function parseIngredients(raw: string[] | null | undefined): ParsedIngredient[] {
  const seen = new Set<string>();
  const out: ParsedIngredient[] = [];
  for (const item of raw ?? []) {
    const text = item.trim();
    if (!text) continue;
    const removable = !text.endsWith("*");
    const name = text.replace(/\*+$/, "").trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push({ name, removable });
  }
  return out;
}

/** Monta o grupo opcional "Retirar ingredientes" (sem custo) com os ingredientes removíveis. */
export function buildRemoveGroup(ingredients: ParsedIngredient[]): MenuOptionGroup | null {
  const removable = ingredients.filter((i) => i.removable);
  if (removable.length === 0) return null;
  return {
    id: REMOVE_GROUP_ID,
    name: "Retirar ingredientes",
    description: "Escolha o que não vai no seu lanche.",
    type: "multiple",
    options: removable.map((i) => ({
      id: `rm:${i.name.toLowerCase()}`,
      name: `Sem ${i.name}`,
      priceDelta: 0,
    })),
  };
}
