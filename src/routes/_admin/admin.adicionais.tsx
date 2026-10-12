import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PriceInput } from "@/components/admin/PriceInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CatalogService, type OptionGroupRow, type OptionRow } from "@/services/admin/CatalogService";

type SharedGroup = OptionGroupRow & { product_options: OptionRow[] };

function SharedGroupsPage() {
  const qc = useQueryClient();
  const [deleting, setDeleting] = React.useState<SharedGroup | null>(null);

  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: ["admin", "shared-groups"],
    queryFn: () => CatalogService.listSharedGroups(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => CatalogService.listCategories(),
  });

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "shared-groups"] });
    await qc.invalidateQueries({ queryKey: ["admin", "product"] });
    await qc.invalidateQueries({ queryKey: ["menu", "catalog"] });
  };
  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const setScope = (g: SharedGroup, ids: string[]) =>
    run(() => CatalogService.updateGroup(g.id, { category_ids: ids }));

  return (
    <AdminShell permission="products.manage">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Cardápio" title="Adicionais" />
        <Button onClick={() => void run(() => CatalogService.createSharedGroup(groups.length + 1))}>
          <Plus className="mr-1 h-4 w-4" />Novo grupo
        </Button>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Aqui você cadastra os adicionais <strong>uma vez só</strong> e escolhe em quais categorias eles aparecem.
        Incluir, mudar o preço, tirar de linha ou apagar um adicional vale na hora para todos os lanches dessas categorias.
      </p>

      <div className="mt-6 space-y-5">
        {isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : null}
        {error ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null}
        {!isLoading && groups.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum grupo ainda. Clique em “Novo grupo” para criar, por exemplo, “Adicionais”.
          </p>
        ) : null}

        {groups.map((g) => {
          const all = g.category_ids.length === 0;
          return (
            <section key={g.id} className="space-y-4 rounded-2xl border p-4">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
                <Input
                  defaultValue={g.name}
                  aria-label="Nome do grupo"
                  onBlur={(e) => e.target.value.trim() && e.target.value !== g.name && void run(() => CatalogService.updateGroup(g.id, { name: e.target.value.trim() }))}
                />
                <Input type="number" className="w-24" min={0} defaultValue={g.min_select} aria-label="Mínimo" title="Mínimo de escolhas"
                  onBlur={(e) => void run(() => CatalogService.updateGroup(g.id, { min_select: Number(e.target.value) || 0 }))} />
                <Input type="number" className="w-24" min={1} defaultValue={g.max_select ?? ""} placeholder="Máx" aria-label="Máximo" title="Máximo de escolhas (vazio = sem limite)"
                  onBlur={(e) => void run(() => CatalogService.updateGroup(g.id, { max_select: e.target.value ? Number(e.target.value) : null }))} />
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={g.required} onCheckedChange={(v) => void run(() => CatalogService.updateGroup(g.id, { required: v, min_select: v ? Math.max(1, g.min_select) : 0 }))} />
                  Obrigatório
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={g.is_active} onCheckedChange={(v) => void run(() => CatalogService.updateGroup(g.id, { is_active: v }))} />
                  Ativo
                </label>
              </div>

              <div className="space-y-2 rounded-xl bg-muted p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Switch
                    checked={all}
                    onCheckedChange={(v) => void setScope(g, v ? [] : categories.map((c) => c.id))}
                  />
                  Aparece em todas as categorias
                </label>
                {!all ? (
                  <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                    {categories.map((c) => {
                      const checked = g.category_ids.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const next = v ? [...g.category_ids, c.id] : g.category_ids.filter((id) => id !== c.id);
                              if (next.length === 0) {
                                toast.error("Escolha ao menos uma categoria, ou use “Aparece em todas”.");
                                return;
                              }
                              void setScope(g, next);
                            }}
                          />
                          {c.name}
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <ul className="space-y-2">
                {g.product_options.slice().sort((a, b) => a.position - b.position).map((o) => (
                  <li key={o.id} className="grid grid-cols-[1fr_120px_auto_auto] items-center gap-2">
                    <Input defaultValue={o.name} aria-label="Nome do adicional"
                      onBlur={(e) => e.target.value.trim() && e.target.value !== o.name && void run(() => CatalogService.updateOption(o.id, { name: e.target.value.trim() }))} />
                    <PriceInput value={o.price_delta} onChange={(v) => v != null && v !== o.price_delta && void run(() => CatalogService.updateOption(o.id, { price_delta: v }))} />
                    <Switch checked={o.is_active} aria-label="Disponível" onCheckedChange={(v) => void run(() => CatalogService.updateOption(o.id, { is_active: v }))} />
                    <Button size="icon" variant="ghost" aria-label="Remover adicional" onClick={() => void run(() => CatalogService.deleteOption(o.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button size="sm" variant="outline" onClick={() => void run(() => CatalogService.createOption({ group_id: g.id, name: "Novo adicional", price_delta: 0, position: g.product_options.length + 1 }))}>
                  <Plus className="mr-1 h-3.5 w-3.5" />Adicional
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(g)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />Apagar grupo
                </Button>
              </div>
            </section>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Apagar grupo de adicionais"
        description="O grupo some de todos os lanches. Pedidos antigos continuam guardados como foram feitos."
        confirmLabel="Apagar"
        destructive
        onConfirm={() => {
          const g = deleting;
          setDeleting(null);
          if (g) void run(() => CatalogService.deleteGroup(g.id));
        }}
      />
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/adicionais")({
  head: () => ({ meta: [{ title: "Adicionais — Admin Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: SharedGroupsPage,
});
