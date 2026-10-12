import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { formatBRL } from "@/components/admin/PriceInput";
import { OrderStatusBadge } from "@/components/order/OrderStatus";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CustomerAdminService } from "@/services/admin/CustomerAdminService";

const PAGE = 30;

function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

function CustomerDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "customer", id], queryFn: () => CustomerAdminService.detail(id!), enabled: Boolean(id) });
  const valid = data?.orders.filter((o) => o.status !== "cancelled") ?? [];
  const spent = valid.reduce((s, o) => s + Number(o.total), 0);
  return (
    <Sheet open={Boolean(id)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader><SheetTitle>{data?.customer?.name ?? "Cliente"}</SheetTitle></SheetHeader>
        {isLoading || !data ? <div className="space-y-3 p-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div> : (
          <div className="space-y-5 p-4 text-sm">
            <div className="rounded-2xl border p-4">
              <p>{data.customer?.phone}</p>
              {data.customer?.email ? <p className="text-muted-foreground">{data.customer.email}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">Cliente desde {new Date(data.customer!.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground">Pedidos</p><p className="font-bold">{valid.length}</p></div>
              <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground">Total gasto</p><p className="font-bold">{formatBRL(spent)}</p></div>
              <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground">Ticket médio</p><p className="font-bold">{valid.length ? formatBRL(spent / valid.length) : "—"}</p></div>
            </div>
            <div className="rounded-2xl border p-4">
              <h4 className="mb-2 font-semibold">Endereços</h4>
              {data.addresses.length === 0 ? <p className="text-muted-foreground">Nenhum endereço salvo.</p> : data.addresses.map((a) => (
                <p key={a.id} className="text-muted-foreground">{a.street}, {a.number} — {a.district}, {a.city}</p>
              ))}
            </div>
            <div className="rounded-2xl border p-4">
              <h4 className="mb-2 font-semibold">Histórico de pedidos</h4>
              <ul className="space-y-2">
                {data.orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2">
                    <span>#{String(o.number).padStart(6, "0")} · {new Date(o.created_at).toLocaleDateString("pt-BR")}</span>
                    <span className="flex items-center gap-2"><OrderStatusBadge status={o.status} />{formatBRL(o.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">Dados pessoais tratados conforme a LGPD — use apenas para atendimento dos pedidos.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CustomersPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const term = useDebounced(search);
  React.useEffect(() => setPage(0), [term]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "customers", term, page],
    queryFn: () => CustomerAdminService.list({ search: term, limit: PAGE, offset: page * PAGE }),
  });
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminShell permission="customers.view">
      <SectionTitle eyebrow="CRM" title="Clientes" />
      <div className="mt-6 space-y-4">
        <FilterBar search={search} onSearch={setSearch} placeholder="Nome, telefone ou e-mail" />
        <DataTable rows={rows} loading={isLoading} error={error ? (error as Error).message : null} rowKey={(r) => r.id} onRowClick={(r) => setSelected(r.id)}
          emptyTitle="Nenhum cliente encontrado"
          columns={[
            { key: "n", header: "Nome", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "p", header: "Telefone", render: (r) => r.phone },
            { key: "o", header: "Pedidos", render: (r) => r.orders_count },
            { key: "s", header: "Total gasto", render: (r) => formatBRL(r.total_spent) },
            { key: "l", header: "Último pedido", render: (r) => (r.last_order_at ? new Date(r.last_order_at).toLocaleDateString("pt-BR") : "—") },
          ]}
          mobileCard={(r) => (
            <div className="flex justify-between gap-3"><div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.phone}</p></div>
              <div className="text-right text-sm"><p className="font-medium">{formatBRL(r.total_spent)}</p><p className="text-xs text-muted-foreground">{r.orders_count} pedido(s)</p></div></div>
          )}
        />
        {total > PAGE ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{page * PAGE + 1}–{Math.min((page + 1) * PAGE, total)} de {total}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <Button size="sm" variant="outline" disabled={(page + 1) * PAGE >= total} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
            </div>
          </div>
        ) : null}
      </div>
      <CustomerDetail id={selected} onClose={() => setSelected(null)} />
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Admin" }, { name: "robots", content: "noindex" }] }),
  component: CustomersPage,
});
