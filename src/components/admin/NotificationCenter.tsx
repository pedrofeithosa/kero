import * as React from "react";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationRow {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  order_created: "Novo pedido recebido",
  order_cancelled: "Pedido cancelado",
  payment_confirmed: "Pagamento confirmado",
  product_sold_out: "Produto esgotado",
  coupon_expiring: "Cupom perto de expirar",
  promotion_started: "Promoção iniciada",
};

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, payload, read_at, created_at")
        .eq("audience", "admin")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as NotificationRow[];
    },
  });

  React.useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unread = data.filter((n) => !n.read_at);

  async function markAllRead() {
    if (unread.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in(
        "id",
        unread.map((n) => n.id),
      );
    void queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          {unread.length > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notificações</span>
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-xs text-primary hover:underline disabled:opacity-50"
            disabled={unread.length === 0}
          >
            Marcar como lidas
          </button>
        </div>
        <ScrollArea className="max-h-80">
          {data.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="divide-y">
              {data.map((n) => {
                const orderNumber = (n.payload as { number?: string } | null)?.number;
                return (
                  <li key={n.id} className={n.read_at ? "px-4 py-3" : "bg-primary/5 px-4 py-3"}>
                    <p className="text-sm font-medium">{TYPE_LABELS[n.type] ?? n.type}</p>
                    {orderNumber ? (
                      <p className="text-xs text-muted-foreground">Pedido {orderNumber}</p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("pt-BR")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
