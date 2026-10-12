import { useQuery } from "@tanstack/react-query";
import { DeliveryService } from "@/services/DeliveryService";

/** Kero Mais — Horário de funcionamento, zonas e consulta de área de entrega. */
export function useStoreStatus() {
  return useQuery({
    queryKey: ["store-status"],
    queryFn: () => DeliveryService.getStoreStatus(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}

export function useDeliveryZones() {
  return useQuery({
    queryKey: ["delivery-zones"],
    queryFn: () => DeliveryService.listZones(),
    staleTime: 10 * 60_000,
  });
}

export function useDelivery(district: string | undefined, city?: string) {
  const normalized = district?.trim() ?? "";
  const area = useQuery({
    queryKey: ["delivery-area", normalized.toLowerCase(), city?.toLowerCase() ?? ""],
    queryFn: () => DeliveryService.checkArea(normalized, city),
    enabled: normalized.length >= 2,
    staleTime: 5 * 60_000,
  });

  return {
    area: area.data,
    isChecking: area.isFetching,
    isBlocked: Boolean(area.data && !area.data.available),
    fee: area.data?.available ? (area.data.fee ?? 0) : 0,
    etaMinutes: area.data?.eta_minutes ?? 45,
  };
}
