import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, DollarSign, ShoppingBag, Users } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { StatCard } from "@/components/admin/StatCard";
import { FilterChips } from "@/components/admin/FilterBar";
import { formatBRL } from "@/components/admin/PriceInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MetricsService,
  RANGE_LABELS,
  resolveRange,
  type RangeId,
} from "@/services/admin/MetricsService";

const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  card_on_delivery: "Cartão na entrega",
  online_card: "Cartão online",
};

const CHART_COLORS = ["var(--color-primary)", "var(--color-accent)", "var(--color-success)", "var(--color-muted-foreground)"];

function delta(current: number, previous: number, hasData: boolean) {
  if (!hasData || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function AdminDashboard() {
  const [range, setRange] = React.useState<RangeId>("7d");
  const { from, to } = React.useMemo(() => resolveRange(range), [range]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "metrics", range],
    queryFn: () => MetricsService.get(from, to),
  });

  const hasPrev = data?.previous.has_data ?? false;

  return (
    <AdminShell permission="dashboard.view">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionTitle eyebrow="Visão geral" title="Dashboard" />
        <FilterChips
          value={range}
          onChange={setRange}
          options={(Object.keys(RANGE_LABELS) as RangeId[]).map((id) => ({ id, label: RANGE_LABELS[id] }))}
        />
      </div>

      {error ? (
        <div className="mt-6">
          <EmptyState title="Não foi possível carregar as métricas" description={(error as Error).message} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={formatBRL(data?.current.revenue ?? 0)}
          icon={DollarSign}
          loading={isLoading}
          delta={delta(data?.current.revenue ?? 0, data?.previous.revenue ?? 0, hasPrev)}
          hasComparison={hasPrev}
        />
        <StatCard
          label="Pedidos"
          value={String(data?.current.orders ?? 0)}
          icon={ShoppingBag}
          loading={isLoading}
          delta={delta(data?.current.orders ?? 0, data?.previous.orders ?? 0, hasPrev)}
          hasComparison={hasPrev}
        />
        <StatCard
          label="Ticket médio"
          value={formatBRL(data?.current.avg_ticket ?? 0)}
          icon={Users}
          loading={isLoading}
          delta={delta(data?.current.avg_ticket ?? 0, data?.previous.avg_ticket ?? 0, hasPrev)}
          hasComparison={hasPrev}
        />
        <StatCard
          label="Pedidos em andamento"
          value={String(data?.current.in_progress ?? 0)}
          icon={Clock}
          loading={isLoading}
          hasComparison={false}
          hint={`${data?.current.cancelled ?? 0} cancelado(s) no período`}
        />
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="Faturamento por dia">
            {data.by_day.length === 0 ? (
              <EmptyState title="Sem pedidos no período" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.by_day}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" fontSize={12} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis fontSize={12} width={70} tickFormatter={(v: number) => formatBRL(v)} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <Panel title="Pedidos por dia">
            {data.by_day.length === 0 ? (
              <EmptyState title="Sem pedidos no período" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.by_day}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" fontSize={12} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis fontSize={12} allowDecimals={false} width={30} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <Panel title="Pedidos por horário">
            {data.by_hour.length === 0 ? (
              <EmptyState title="Sem pedidos no período" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.by_hour}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" fontSize={12} tickFormatter={(h: number) => `${h}h`} />
                  <YAxis fontSize={12} allowDecimals={false} width={30} />
                  <Tooltip labelFormatter={(h) => `${h}h`} />
                  <Bar dataKey="orders" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <Panel title="Formas de pagamento">
            {data.by_payment.length === 0 ? (
              <EmptyState title="Sem pagamentos no período" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.by_payment.map((p) => ({ ...p, label: PAYMENT_LABELS[p.method] ?? p.method }))}
                    dataKey="orders"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={90}
                    label={(entry: { label?: string }) => entry.label ?? ""}
                  >
                    {data.by_payment.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <Panel title="Produtos mais vendidos">
            {data.top_products.length === 0 ? (
              <EmptyState title="Sem vendas no período" />
            ) : (
              <ul className="space-y-3">
                {data.top_products.slice(0, 8).map((p) => (
                  <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {p.quantity} un · {formatBRL(p.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Categorias mais vendidas">
            {data.top_categories.length === 0 ? (
              <EmptyState title="Sem vendas no período" />
            ) : (
              <ul className="space-y-3">
                {data.top_categories.slice(0, 8).map((c) => (
                  <li key={c.category} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{c.category}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {c.quantity} un · {formatBRL(c.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      ) : null}
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin — Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});
