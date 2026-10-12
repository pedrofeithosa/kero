import { groupHours, useStoreHours } from "@/features/store/hours";
import { cn } from "@/lib/utils";

/** Kero Mais — Lista de horários de funcionamento (lê o que está configurado no admin) */
export function StoreHoursList({ className }: { className?: string }) {
  const { data } = useStoreHours();
  const groups = data ? groupHours(data) : [];
  if (groups.length === 0) return null;
  return (
    <ul className={cn("space-y-0.5", className)}>
      {groups.map((g) => (
        <li key={g.days}>
          {g.days} · {g.label}
        </li>
      ))}
    </ul>
  );
}
