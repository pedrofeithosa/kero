import { SearchInput } from "@/components/ui/field-inputs";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

/** Kero Mais — Busca instantânea do cardápio */
export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="w-full">
      <label htmlFor="menu-search" className="sr-only">
        Buscar no cardápio
      </label>
      <SearchInput
        id="menu-search"
        placeholder="O que você deseja hoje?"
        value={value}
        autoComplete="off"
        maxLength={80}
        onChange={(e) => onChange(e.target.value)}
        onClear={() => onChange("")}
        aria-describedby="menu-search-status"
      />
      <p id="menu-search-status" aria-live="polite" className="sr-only">
        {resultCount != null ? `${resultCount} produtos encontrados` : ""}
      </p>
    </div>
  );
}
