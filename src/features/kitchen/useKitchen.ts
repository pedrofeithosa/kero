import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KitchenService, type KitchenOrder } from "@/services/KitchenService";

export type ConnectionState = "online" | "reconnecting" | "offline";

export const KITCHEN_QUERY_KEY = ["kitchen", "orders"] as const;

/**
 * Pedidos ativos da cozinha. Usa Realtime e, por segurança, também consulta
 * de 10 em 10 segundos (se o Realtime cair, a tela continua atualizando).
 */
export function useKitchenOrders() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: KITCHEN_QUERY_KEY,
    queryFn: KitchenService.listActive,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });

  const [channelState, setChannelState] = React.useState<"online" | "reconnecting">("reconnecting");
  const [browserOnline, setBrowserOnline] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = KitchenService.subscribe(
      () => void queryClient.invalidateQueries({ queryKey: KITCHEN_QUERY_KEY }),
      (state) => setChannelState(state === "SUBSCRIBED" ? "online" : "reconnecting"),
    );
    return unsubscribe;
  }, [queryClient]);

  React.useEffect(() => {
    const update = () => setBrowserOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const connection: ConnectionState =
    !browserOnline || query.isError ? "offline" : channelState;

  return { ...query, orders: query.data ?? ([] as KitchenOrder[]), connection };
}

/** Hora atual, atualizada a cada 30 s (para os "há X min" dos cartões). */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function playBeep(ctx: AudioContext) {
  const start = ctx.currentTime;
  [880, 1175, 880, 1175].forEach((freq, i) => {
    const t = start + i * 0.22;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  });
}

/**
 * Alerta sonoro enquanto houver pedido NOVO esperando (toca de 7 em 7 segundos).
 * Os navegadores só liberam som depois de um toque do usuário, por isso existe o `enable`.
 */
export function useKitchenAlert(waitingCount: number) {
  const ctxRef = React.useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = React.useState(false);

  const enable = React.useCallback(() => {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctxRef.current = ctxRef.current ?? new Ctor();
      void ctxRef.current.resume();
      playBeep(ctxRef.current);
      setSoundOn(true);
    } catch {
      setSoundOn(false);
    }
  }, []);

  const disable = React.useCallback(() => setSoundOn(false), []);

  const hasWaiting = waitingCount > 0;
  React.useEffect(() => {
    if (!soundOn || !hasWaiting || !ctxRef.current) return;
    const ring = () => {
      if (ctxRef.current) playBeep(ctxRef.current);
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    };
    ring();
    const id = window.setInterval(ring, 7000);
    return () => window.clearInterval(id);
  }, [soundOn, hasWaiting]);

  return { soundOn, enable, disable };
}

/** Mantém a tela do celular ligada enquanto o painel está aberto. */
export function useWakeLock() {
  React.useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const wl = (navigator as unknown as {
          wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
        }).wakeLock;
        if (!wl || document.visibilityState !== "visible") return;
        const sentinel = await wl.request("screen");
        if (cancelled) void sentinel.release();
        else lock = sentinel;
      } catch {
        /* sem suporte ou negado: segue sem manter a tela ligada */
      }
    };
    void request();
    document.addEventListener("visibilitychange", request);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      void lock?.release();
    };
  }, []);
}
