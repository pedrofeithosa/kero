import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, BellOff, ChefHat, Loader2, Wifi, WifiOff } from "lucide-react";
import { KDSShell } from "@/components/layout/KDSShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { KitchenOrderCard } from "@/components/kitchen/KitchenOrderCard";
import { PrintTicket } from "@/components/kitchen/PrintTicket";
import {
  KITCHEN_QUERY_KEY,
  useKitchenAlert,
  useKitchenOrders,
  useNow,
  useWakeLock,
} from "@/features/kitchen/useKitchen";
import { cn } from "@/lib/utils";
import { KitchenService, type KitchenOrder, type KitchenStatus } from "@/services/KitchenService";

type TabId = "new" | "preparing" | "ready";

const TABS: { id: TabId; label: string; statuses: KitchenStatus[]; empty: string }[] = [
  { id: "new", label: "Novos", statuses: ["received", "accepted"], empty: "Nenhum pedido novo." },
  { id: "preparing", label: "Em preparo", statuses: ["preparing"], empty: "Nada em preparo agora." },
  { id: "ready", label: "Prontos", statuses: ["ready", "out_for_delivery"], empty: "Nenhum pedido pronto." },
];

function KitchenPage() {
  const queryClient = useQueryClient();
  const { orders, isLoading, error, connection, refetch } = useKitchenOrders();
  const now = useNow();
  const [tab, setTab] = React.useState<TabId>("new");
  const [printing, setPrinting] = React.useState<KitchenOrder | null>(null);

  useWakeLock();

  const byTab = React.useMemo(() => {
    const map: Record<TabId, KitchenOrder[]> = { new: [], preparing: [], ready: [] };
    for (const o of orders) {
      const t = TABS.find((x) => x.statuses.includes(o.status));
      if (t) map[t.id].push(o);
    }
    return map;
  }, [orders]);

  const waitingCount = orders.filter((o) => o.status === "received").length;
  const { soundOn, enable, disable } = useKitchenAlert(waitingCount);

  React.useEffect(() => {
    document.title = waitingCount > 0 ? `(${waitingCount}) Cozinha — Kero Mais` : "Cozinha — Kero Mais";
  }, [waitingCount]);

  const mutation = useMutation({
    mutationFn: (input: { id: string; status: KitchenStatus }) =>
      KitchenService.setStatus(input.id, input.status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: KITCHEN_QUERY_KEY }),
    onError: (e: Error) => toast.error(`Não foi possível atualizar o pedido: ${e.message}`),
  });

  /* Impressão: monta a comanda, abre a janela de impressão do aparelho e limpa depois. */
  React.useEffect(() => {
    if (!printing) return;
    const timer = window.setTimeout(() => window.print(), 150);
    const done = () => setPrinting(null);
    window.addEventListener("afterprint", done);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [printing]);

  const list = byTab[tab];
  const current = TABS.find((t) => t.id === tab)!;

  const connectionBadge = (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
        connection === "online" && "bg-success text-success-foreground",
        connection === "reconnecting" && "bg-highlight text-highlight-foreground",
        connection === "offline" && "bg-destructive text-destructive-foreground",
      )}
    >
      {connection === "online" ? <Wifi className="size-3.5" /> : connection === "offline" ? <WifiOff className="size-3.5" /> : <Loader2 className="size-3.5 animate-spin" />}
      {connection === "online" ? "Online" : connection === "offline" ? "Sem conexão" : "Reconectando"}
    </span>
  );

  const soundButton = (
    <Button
      size="icon-sm"
      variant={soundOn ? "success" : "outline"}
      aria-label={soundOn ? "Desligar som" : "Ligar som"}
      onClick={soundOn ? disable : enable}
    >
      {soundOn ? <Bell /> : <BellOff />}
    </Button>
  );

  return (
    <KDSShell right={<>{connectionBadge}{soundButton}</>}>
      {!soundOn ? (
        <button
          type="button"
          onClick={enable}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-highlight px-4 py-4 text-lg font-extrabold text-highlight-foreground shadow-soft"
        >
          <Bell className="size-5" /> Toque aqui para ativar o som dos pedidos
        </button>
      ) : null}

      <div role="tablist" aria-label="Fila de pedidos" className="sticky top-14 z-30 -mx-3 mb-3 grid grid-cols-3 gap-2 bg-background/95 px-3 py-2 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl border-2 px-2 py-3 text-center font-display font-bold leading-tight",
              tab === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
            )}
          >
            <span className="block text-sm">{t.label}</span>
            <span className="block text-2xl">{byTab[t.id].length}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-8 animate-spin" aria-label="Carregando" /></div>
      ) : error ? (
        <EmptyState
          title="Não consegui carregar os pedidos"
          description={(error as Error).message}
          action={<Button onClick={() => void refetch()}>Tentar de novo</Button>}
        />
      ) : list.length === 0 ? (
        <EmptyState icon={<ChefHat className="h-6 w-6" />} title={current.empty} description="Os pedidos aparecem aqui sozinhos." />
      ) : (
        <div className="space-y-4">
          {list.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              now={now}
              busy={mutation.isPending && mutation.variables?.id === order.id}
              onAdvance={(o, next) => mutation.mutate({ id: o.id, status: next })}
              onPrint={setPrinting}
            />
          ))}
        </div>
      )}

      <PrintTicket order={printing} />
    </KDSShell>
  );
}

export const Route = createFileRoute("/_kitchen/kds/")({
  head: () => ({ meta: [{ title: "Cozinha — Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: KitchenPage,
});
