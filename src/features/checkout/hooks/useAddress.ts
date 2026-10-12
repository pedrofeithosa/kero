import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomerService } from "@/services/CustomerService";
import { DeliveryService } from "@/services/DeliveryService";
import type { AddressInput } from "@/features/checkout/types";

/** Kero Mais — Endereços salvos + preenchimento automático por CEP. */
export function useAddress() {
  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => CustomerService.listAddresses(),
    staleTime: 60_000,
  });

  const [isLookingUp, setLookingUp] = React.useState(false);

  const lookupZip = React.useCallback(async (zip: string) => {
    setLookingUp(true);
    try {
      const found = await DeliveryService.lookupZip(zip);
      if (!found) {
        toast.error("CEP não encontrado. Preencha o endereço manualmente.");
        return null;
      }
      return found as Partial<AddressInput>;
    } catch {
      toast.error("Não foi possível consultar o CEP agora.");
      return null;
    } finally {
      setLookingUp(false);
    }
  }, []);

  const setFavorite = useMutation({
    mutationFn: (id: string) => CustomerService.setFavorite(id),
    onSuccess: () => {
      toast.success("Endereço favorito atualizado");
      void addresses.refetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    addresses: addresses.data ?? [],
    isLoading: addresses.isLoading,
    favorite: (addresses.data ?? []).find((a) => a.is_favorite) ?? null,
    lookupZip,
    isLookingUp,
    setFavorite,
  };
}
