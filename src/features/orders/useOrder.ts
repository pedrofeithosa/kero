import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { OrderService } from "@/services/OrderService";

/** Kero Mais — Acompanhamento do pedido com atualização em tempo real. */
export function useOrder(token: string | undefined) {
  const query = useQuery({
    queryKey: ["order", token],
    queryFn: () => OrderService.getByToken(token!),
    enabled: Boolean(token),
    staleTime: 15_000,
  });

  const orderId = query.data?.id;
  const refetch = query.refetch;

  React.useEffect(() => {
    if (!orderId) return;
    return OrderService.subscribe(orderId, () => {
      void refetch();
    });
  }, [orderId, refetch]);

  return query;
}
