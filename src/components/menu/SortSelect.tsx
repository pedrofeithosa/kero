import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/features/menu/useMenu";
import type { SortId } from "@/features/menu/types";

/** Kero Mais — Ordenação do cardápio */
export function SortSelect({
  value,
  onChange,
}: {
  value: SortId;
  onChange: (value: SortId) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortId)}>
      <SelectTrigger aria-label="Ordenar produtos" className="w-full sm:w-56">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
