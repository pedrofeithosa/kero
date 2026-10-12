import * as React from "react";
import { Input } from "@/components/ui/input";

interface PriceInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

/** Campo de preço em reais, aceita vírgula ou ponto. */
export function PriceInput({ value, onChange, placeholder = "0,00", id, disabled }: PriceInputProps) {
  const [text, setText] = React.useState(value != null ? String(value).replace(".", ",") : "");

  React.useEffect(() => {
    setText(value != null ? String(value).replace(".", ",") : "");
  }, [value]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        id={id}
        inputMode="decimal"
        disabled={disabled}
        className="pl-9"
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          const raw = event.target.value.replace(/[^\d.,]/g, "");
          setText(raw);
          const parsed = Number(raw.replace(/\./g, "").replace(",", "."));
          onChange(raw === "" ? null : Number.isNaN(parsed) ? null : parsed);
        }}
      />
    </div>
  );
}

export function formatBRL(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}
