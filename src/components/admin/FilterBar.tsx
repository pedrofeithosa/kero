import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  search?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({
  search,
  onSearch,
  placeholder = "Buscar...",
  children,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {onSearch ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={placeholder}
              className="pl-9"
            />
          </div>
        ) : null}
        {children}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

interface FilterChipsProps<T extends string> {
  value: T;
  options: Array<{ id: T; label: string; count?: number }>;
  onChange: (value: T) => void;
}

export function FilterChips<T extends string>({ value, options, onChange }: FilterChipsProps<T>) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors",
            value === option.id
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined ? (
            <span className="ml-1.5 text-xs opacity-80">{option.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
