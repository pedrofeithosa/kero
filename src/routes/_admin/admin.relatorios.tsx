import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatBRL } from "@/components/admin/PriceInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricsService } from "@/services/admin/MetricsService";

const iso = (d: Date) => d.toISOString().slice(0, 10);

function ReportsPage() {
  const [from, setFrom] = React.useState(() => { const d = new Date(); d.setDate(d.getDate() - 29); return iso(d); });
  const [to, setTo] = React.useState(() => iso(new Date()));
  const valid = from <= to;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "report", from, to],
    enabled: valid,
    queryFn: () => MetricsService.get(new Date(`${from}T00:00:00`), new Date(`${to}T23:59:59.999`)),
  });

  return (
    <AdminShell permission="reports.view">
      <SectionTitle eyebrow="Análise" title="Relatórios" />
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="space-y-1.5"><Label htmlFor="r-f">De</Label><Input id="r-f" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="r-t">Até</Label><Input id="r-t" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></div>
        <p className="text-xs text-muted-foreground">Exportação em CSV/PDF chegará em breve.</p>
      </div>
      {!valid ? <div className="mt-6"><EmptyState title="Período inválido" description="A data inicial deve ser anterior à final." /></div>
        : error ? <div className="mt-6"><EmptyState title="Não foi possível gerar o relatório" description={(error as Error).message} /></div>
        : isLoading || !data ? <Skeleton className="mt-6 h-80 rounded-2xl" /> : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["Faturamento", formatBRL(data.current.revenue)], ["Pedidos", String(data.current.orders)], ["Ticket médio", formatBRL(data.current.avg_ticket)], ["Cancelados", String(data.current.cancelled)]].map(([l, v]) => (
              <div key={l} className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-2 font-display text-2xl font-bold">{v}</p></div>
            ))}
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">Vendas por dia</h3>
            {data.by_day.length === 0 ? <p className="text-sm text-muted-foreground">Sem pedidos no período.</p> : (
              <ul className="divide-y text-sm">
                {data.by_day.map((d) => <li key={d.day} className="flex justify-between py-2"><span>{new Date(`${d.day}T12:00:00`).toLocaleDateString("pt-BR")}</span><span>{d.orders} pedido(s) · {formatBRL(d.revenue)}</span></li>)}
              </ul>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="mb-3 font-semibold">Produtos</h3>
              {data.top_products.length === 0 ? <p className="text-sm text-muted-foreground">Sem vendas.</p> : (
                <ul className="divide-y text-sm">{data.top_products.map((p) => <li key={p.name} className="flex justify-between py-2"><span>{p.name}</span><span>{p.quantity} un · {formatBRL(p.revenue)}</span></li>)}</ul>
              )}
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="mb-3 font-semibold">Categorias</h3>
              {data.top_categories.length === 0 ? <p className="text-sm text-muted-foreground">Sem vendas.</p> : (
                <ul className="divide-y text-sm">{data.top_categories.map((c) => <li key={c.category} className="flex justify-between py-2"><span>{c.category}</span><span>{c.quantity} un · {formatBRL(c.revenue)}</span></li>)}</ul>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ReportsPage,
});
