import * as React from "react";
import { toast } from "sonner";

const STORAGE_KEY = "kero-mais:favorites:v1";

/**
 * Favoritos do cliente.
 * Visitante: LocalStorage. Usuário autenticado: será persistido no Lovable Cloud
 * (tabela `favorites`) quando o backend for ativado.
 */
export function useFavorites() {
  const [ids, setIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* noop */
    }
  }, []);

  const persist = (next: string[]) => {
    setIds(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };

  const isFavorite = React.useCallback((id: string) => ids.includes(id), [ids]);

  const toggleFavorite = React.useCallback(
    (id: string, name?: string) => {
      const has = ids.includes(id);
      persist(has ? ids.filter((f) => f !== id) : [...ids, id]);
      if (name) {
        toast[has ? "info" : "success"](
          has ? `${name} removido dos favoritos` : `${name} salvo nos favoritos`,
        );
      }
    },
    [ids],
  );

  return { favorites: ids, isFavorite, toggleFavorite };
}
