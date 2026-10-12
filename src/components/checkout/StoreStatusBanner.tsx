import { Clock, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/features/checkout/CheckoutProvider";

function nextOpeningISO(opensAt?: string | null) {
  const now = new Date();
  const [h, m] = (opensAt ?? "18:00").split(":").map(Number);
  const target = new Date(now);
  target.setHours(h ?? 18, m ?? 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.toISOString();
}

/** Kero Mais — Aviso de horário de funcionamento com opção de agendamento */
export function StoreStatusBanner() {
  const { storeStatus, scheduledFor, setScheduledFor } = useCheckout();
  if (!storeStatus || storeStatus.open) return null;

  const suggestion = nextOpeningISO(storeStatus.opens_at);
  const label = new Date(suggestion).toLocaleString("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-card border border-warning/40 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-display font-bold">Estamos fechados no momento</p>
            <p className="text-small text-muted-foreground">
              {storeStatus.reason ?? "Fora do horário de funcionamento"}
              {storeStatus.opens_at ? ` — abrimos às ${storeStatus.opens_at}.` : "."}
            </p>
          </div>
          {scheduledFor ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-small font-semibold text-success">
                Pedido agendado para {new Date(scheduledFor).toLocaleString("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setScheduledFor(null)}>
                Cancelar agendamento
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setScheduledFor(suggestion)}>
              <CalendarClock /> Agendar para {label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
