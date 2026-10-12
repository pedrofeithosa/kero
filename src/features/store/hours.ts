import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/** Horários de funcionamento: vêm da tabela store_hours (editável em /admin/config > Horários). */
export type StoreHourRow = Tables<"store_hours">;

export const storeHoursQueryOptions = queryOptions({
  queryKey: ["store", "hours"],
  staleTime: 5 * 60_000,
  queryFn: async (): Promise<StoreHourRow[]> => {
    const { data, error } = await supabase.from("store_hours").select("*").order("weekday");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export function useStoreHours() {
  return useQuery(storeHoursQueryOptions);
}

/** 0 = domingo (mesma convenção do banco) */
const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAY_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const hhmm = (t: string) => t.slice(0, 5);

/** 19:00 -> "19h" · 19:15 -> "19h15" */
function friendly(t: string) {
  const [h, m] = hhmm(t).split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

function joinDays(weekdays: number[]) {
  if (weekdays.length === 7) return "Todos os dias";
  const names = weekdays.map((d) => DAY_SHORT[d]);
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export interface HoursGroup {
  days: string;
  label: string;
  closed: boolean;
}

/** Junta os dias com o mesmo horário: "Qua e Qui · 19h15 às 22h40". Dias fechados vão por último. */
export function groupHours(rows: StoreHourRow[]): HoursGroup[] {
  const groups = new Map<string, { weekdays: number[]; label: string; closed: boolean }>();
  for (const r of [...rows].sort((a, b) => a.weekday - b.weekday)) {
    const key = r.is_closed ? "closed" : `${hhmm(r.opens_at)}-${hhmm(r.closes_at)}`;
    const g = groups.get(key) ?? {
      weekdays: [],
      closed: r.is_closed,
      label: r.is_closed ? "Fechado" : `${friendly(r.opens_at)} às ${friendly(r.closes_at)}`,
    };
    g.weekdays.push(r.weekday);
    groups.set(key, g);
  }
  return [...groups.values()]
    .sort((a, b) => Number(a.closed) - Number(b.closed))
    .map((g) => ({ days: joinDays(g.weekdays), label: g.label, closed: g.closed }));
}

/** Dados estruturados (Google). Só inclui os dias abertos; sem horários, não inclui nada. */
export function openingHoursProps(rows: StoreHourRow[] | undefined) {
  const open = (rows ?? []).filter((r) => !r.is_closed);
  if (open.length === 0) return {};
  const byTime = new Map<string, { days: string[]; opens: string; closes: string }>();
  for (const r of open) {
    const key = `${hhmm(r.opens_at)}-${hhmm(r.closes_at)}`;
    const g = byTime.get(key) ?? { days: [], opens: hhmm(r.opens_at), closes: hhmm(r.closes_at) };
    g.days.push(DAY_SCHEMA[r.weekday]);
    byTime.set(key, g);
  }
  return {
    openingHoursSpecification: [...byTime.values()].map((g) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: g.days,
      opens: g.opens,
      closes: g.closes,
    })),
  };
}
