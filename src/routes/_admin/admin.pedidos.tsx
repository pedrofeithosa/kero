import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar, FilterChips } from "@/components/admin/FilterBar";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { formatBRL } from "@/components/admin/PriceInput";
import { OrderStatusBadge } from "@/components/order/OrderStatus";
import {
  ORDER_STATUS_LABELS,
  OrderAdminService,
  type OrderStatus,
} from "@/services/admin/OrderAdminService";

type Filter = OrderStatus | "all";
const FILTERS: Filter[] = ["all", "received", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

function OrdersPage() {
  const [status, setStatus] = React.useState<Filter>("all");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", "orders", status],
    queryFn: () => OrderAdminService.list({ status, limit: 100 }),
  });

  React.useEffect(
    () => OrderAdminService.subscribe(() => void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })),
    [queryClient],
  );

  const term = search.trim().toLowerCase();
  const rows = term
    ? data.filter(
        (o) =>
          String(o.number).includes(term) ||
          (o.customers?.name ?? "").toLowerCase().includes(term) ||
          (o.customers?.phone ?? "").includes(term),
      )
    : data;

  const num = (n: number) => `#${String(n).padStart(6, "0")}`;

  return (
    <AdminShell permission="orders.view">
      <SectionTitle eyebrow="Operação" title="Pedidos" />
      <div className="mt-6 space-y-4">
        <FilterBar search={search} onSearch={setSearch} placeholder="Número, cliente ou telefone" />
        <FilterChips
          value={status}
          onChange={setStatus}
          options={FILTERS.map((id) => ({ id, label: id === "all" ? "Todos" : ORDER_STATUS_LABELS[id] }))}
        />
        <DataTable
          rows={rows}
          loading={isLoading}
          error={error ? (error as Error).message : null}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelected(r.id)}
          emptyTitle="Nenhum pedido encontrado"
          columns={[
            { key: "n", header: "Pedido", render: (r) => <span className="font-semibold">{num(r.number)}</span> },
            { key: "c", header: "Cliente", render: (r) => r.customers?.name ?? "—" },
            { key: "t", header: "Tipo", render: (r) => (r.delivery_type === "delivery" ? "Entrega" : "Retirada") },
            { key: "s", header: "Status", render: (r) => <OrderStatusBadge status={r.status} /> },
            { key: "v", header: "Total", className: "text-right", render: (r) => formatBRL(r.total) },
            { key: "d", header: "Data", render: (r) => new Date(r.created_at).toLocaleString("pt-BR") },
          ]}
          mobileCard={(r) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{num(r.number)}</span>
                <OrderStatusBadge status={r.status} />
              </div>
              <p className="text-sm">{r.customers?.name ?? "—"}</p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{new Date(r.created_at).toLocaleString("pt-BR")}</span>
                <span className="font-medium text-foreground">{formatBRL(r.total)}</span>
              </div>
            </div>
          )}
        />
      </div>
      <OrderDetails orderId={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos — Admin Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: OrdersPage,
});
