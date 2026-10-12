import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PriceInput, formatBRL } from "@/components/admin/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useImageUrl } from "@/lib/storage";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { CatalogService, type OptionGroupRow, type OptionRow, type ProductRow } from "@/services/admin/CatalogService";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface Form {
  id?: string; name: string; description: string; ingredients: string; category_id: string; price: number | null;
  compare_at: number | null; image_url: string | null; prep_time_minutes: number; availability: string;
  is_active: boolean; is_featured: boolean; is_best_seller: boolean; is_new: boolean; position: number;
}

function Thumb({ path }: { path: string | null }) {
  const url = useImageUrl(path);
  return url ? <img src={url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-muted" />;
}

type Group = OptionGroupRow & { product_options: OptionRow[] };

function OptionGroupsEditor({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const key = ["admin", "product", productId];
  const { data } = useQuery({ queryKey: key, queryFn: () => CatalogService.getProduct(productId) });
  const groups = (data?.product_option_groups ?? []).slice().sort((a, b) => a.position - b.position) as Group[];
  const { data: sharedAll = [] } = useQuery({ queryKey: ["admin", "shared-groups"], queryFn: () => CatalogService.listSharedGroups() });
  const sharedHere = sharedAll.filter(
    (g) => g.is_active && (g.category_ids.length === 0 || (data?.category_id != null && g.category_ids.includes(data.category_id))),
  );
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const run = async (fn: () => Promise<unknown>) => { try { await fn(); await refresh(); } catch (e) { toast.error((e as Error).message); } };

  return (
    <div className="space-y-4">
      {sharedHere.length > 0 ? (
        <p className="rounded-xl bg-muted p-3 text-sm">
          Também aparecem neste produto (valem para vários lanches):{" "}
          <strong>{sharedHere.map((g) => g.name).join(", ")}</strong>.{" "}
          Para mudar, vá em <Link to="/admin/adicionais" className="text-primary underline">Adicionais</Link>.
        </p>
      ) : null}
      {groups.map((g) => (
        <div key={g.id} className="space-y-3 rounded-2xl border p-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
            <Input defaultValue={g.name} aria-label="Nome do grupo" onBlur={(e) => e.target.value !== g.name && void run(() => CatalogService.updateGroup(g.id, { name: e.target.value }))} />
            <Input type="number" className="w-20" min={0} defaultValue={g.min_select} aria-label="Mínimo" title="Mínimo" onBlur={(e) => void run(() => CatalogService.updateGroup(g.id, { min_select: Number(e.target.value) }))} />
            <Input type="number" className="w-20" min={1} defaultValue={g.max_select ?? ""} placeholder="Máx" aria-label="Máximo" title="Máximo" onBlur={(e) => void run(() => CatalogService.updateGroup(g.id, { max_select: e.target.value ? Number(e.target.value) : null }))} />
            <label className="flex items-center gap-2 text-xs"><Switch checked={g.required} onCheckedChange={(v) => void run(() => CatalogService.updateGroup(g.id, { required: v, min_select: v ? Math.max(1, g.min_select) : 0 }))} />Obrigatório</label>
            <Button size="icon" variant="ghost" aria-label="Remover grupo" onClick={() => void run(() => CatalogService.deleteGroup(g.id))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <ul className="space-y-2">
            {g.product_options.slice().sort((a, b) => a.position - b.position).map((o) => (
              <li key={o.id} className="grid grid-cols-[1fr_120px_auto_auto] items-center gap-2">
                <Input defaultValue={o.name} aria-label="Nome do adicional" onBlur={(e) => e.target.value !== o.name && void run(() => CatalogService.updateOption(o.id, { name: e.target.value }))} />
                <PriceInput value={o.price_delta} onChange={(v) => v != null && v !== o.price_delta && void run(() => CatalogService.updateOption(o.id, { price_delta: v }))} />
                <Switch checked={o.is_active} aria-label="Disponível" onCheckedChange={(v) => void run(() => CatalogService.updateOption(o.id, { is_active: v }))} />
                <Button size="icon" variant="ghost" aria-label="Remover adicional" onClick={() => void run(() => CatalogService.deleteOption(o.id))}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="outline" onClick={() => void run(() => CatalogService.createOption({ group_id: g.id, name: "Novo adicional", price_delta: 0, position: g.product_options.length + 1 }))}>
            <Plus className="mr-1 h-3.5 w-3.5" />Adicional
          </Button>
        </div>
      ))}
      <Button size="sm" variant="secondary" onClick={() => void run(() => CatalogService.createGroup({ product_id: productId, name: "Adicionais", type: "multiple", position: groups.length + 1, min_select: 0 }))}>
        <Plus className="mr-1 h-3.5 w-3.5" />Grupo de adicionais
      </Button>
    </div>
  );
}

function ProductsPage() {
  const qc = useQueryClient();
  const { can } = useAdminAuth();
  const editable = can("products.manage");
  const [search, setSearch] = React.useState("");
  const [form, setForm] = React.useState<Form | null>(null);
  const [archiving, setArchiving] = React.useState<ProductRow | null>(null);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin", "products", "all"], queryFn: () => CatalogService.listProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["admin", "categories"], queryFn: () => CatalogService.listCategories() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const term = search.trim().toLowerCase();
  const rows = term ? data.filter((p) => p.name.toLowerCase().includes(term)) : data;

  const save = useMutation({
    mutationFn: async (f: Form) => {
      if (f.name.trim().length < 2) throw new Error("Informe o nome do produto.");
      if (f.price == null || f.price <= 0) throw new Error("Informe um preço maior que zero.");
      if (f.compare_at != null && f.compare_at <= f.price) throw new Error("O preço “de” deve ser maior que o preço atual.");
      const payload = {
        name: f.name.trim(), description: f.description.trim(), ingredients: f.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        category_id: f.category_id || null, price: f.price, compare_at: f.compare_at, image_url: f.image_url,
        prep_time_minutes: f.prep_time_minutes, availability: f.availability, is_active: f.is_active, is_featured: f.is_featured,
        is_best_seller: f.is_best_seller, is_new: f.is_new, position: f.position,
      };
      if (f.id) { await CatalogService.updateProduct(f.id, payload); return f.id; }
      const created = await CatalogService.createProduct({ ...payload, slug: `${slugify(f.name)}-${Date.now().toString(36)}` });
      return created.id;
    },
    onSuccess: async (id) => { await refresh(); toast.success("Produto salvo."); setForm((f) => (f ? { ...f, id } : f)); },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => CatalogService.archiveProduct(id),
    onSuccess: async () => { await refresh(); setArchiving(null); setForm(null); toast.success("Produto arquivado. O histórico de vendas foi mantido."); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function quickToggle(p: ProductRow) {
    try { await CatalogService.updateProduct(p.id, { is_active: !p.is_active }); await refresh(); } catch (e) { toast.error((e as Error).message); }
  }

  const open = (p?: ProductRow) => setForm(p ? {
    id: p.id, name: p.name, description: p.description, ingredients: p.ingredients.join(", "), category_id: p.category_id ?? "",
    price: p.price, compare_at: p.compare_at, image_url: p.image_url, prep_time_minutes: p.prep_time_minutes, availability: p.availability,
    is_active: p.is_active, is_featured: p.is_featured, is_best_seller: p.is_best_seller, is_new: p.is_new, position: p.position,
  } : {
    name: "", description: "", ingredients: "", category_id: categories[0]?.id ?? "", price: null, compare_at: null, image_url: null,
    prep_time_minutes: 20, availability: "available", is_active: true, is_featured: false, is_best_seller: false, is_new: true, position: data.length + 1,
  });

  const flags = (p: ProductRow) => (
    <div className="flex flex-wrap gap-1">
      {p.is_featured ? <Badge variant="info">Destaque</Badge> : null}
      {p.is_best_seller ? <Badge variant="warning">Mais vendido</Badge> : null}
      {p.is_new ? <Badge variant="success">Novo</Badge> : null}
      {p.availability === "sold_out" ? <Badge variant="destructive">Esgotado</Badge> : null}
    </div>
  );

  return (
    <AdminShell permission="products.view">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Cardápio" title="Produtos" />
        {editable ? <Button onClick={() => open()}><Plus className="mr-1 h-4 w-4" />Novo produto</Button> : null}
      </div>
      <div className="mt-6 space-y-4">
        <FilterBar search={search} onSearch={setSearch} placeholder="Buscar produto" />
        <DataTable rows={rows} loading={isLoading} error={error ? (error as Error).message : null} rowKey={(r) => r.id}
          onRowClick={editable ? (r) => open(r) : undefined} emptyTitle="Nenhum produto encontrado"
          columns={[
            { key: "i", header: "", render: (r) => <Thumb path={r.image_url} /> },
            { key: "n", header: "Produto", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.categories?.name ?? "Sem categoria"}</p></div> },
            { key: "p", header: "Preço", render: (r) => <span>{formatBRL(r.price)}{r.compare_at ? <span className="ml-1 text-xs text-muted-foreground line-through">{formatBRL(r.compare_at)}</span> : null}</span> },
            { key: "f", header: "Selos", render: flags },
            { key: "a", header: "Ativo", render: (r) => <span onClick={(e) => e.stopPropagation()}><Switch checked={r.is_active} disabled={!editable} onCheckedChange={() => void quickToggle(r)} aria-label="Ativar produto" /></span> },
          ]}
          mobileCard={(r) => (
            <div className="flex items-center gap-3"><Thumb path={r.image_url} />
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{r.name}</p><p className="text-sm">{formatBRL(r.price)}</p>{flags(r)}</div>
              <span onClick={(e) => e.stopPropagation()}><Switch checked={r.is_active} disabled={!editable} onCheckedChange={() => void quickToggle(r)} aria-label="Ativar produto" /></span>
            </div>
          )}
        />
      </div>

      <Sheet open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader><SheetTitle>{form?.id ? "Editar produto" : "Novo produto"}</SheetTitle></SheetHeader>
          {form ? (
            <div className="space-y-6 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="p-n">Nome</Label><Input id="p-n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="p-d">Descrição</Label><Textarea id="p-d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="p-i">Ingredientes (separados por vírgula)</Label><Input id="p-i" value={form.ingredients} placeholder="pão*, hambúrguer 180g*, alface, tomate, cheddar" onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /><p className="text-xs text-muted-foreground">Todos aparecem para o cliente e viram a opção “Sem …” para retirar. Coloque <strong>*</strong> depois do que <strong>não pode ser retirado</strong> (ex.: pão*). Em bebidas, deixe em branco.</p></div>
                <div className="space-y-1.5"><Label>Categoria</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Disponibilidade</Label>
                  <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="available">Disponível</SelectItem><SelectItem value="sold_out">Esgotado</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Preço</Label><PriceInput value={form.price} onChange={(v) => setForm({ ...form, price: v })} /></div>
                <div className="space-y-1.5"><Label>Preço “de” (promoção)</Label><PriceInput value={form.compare_at} onChange={(v) => setForm({ ...form, compare_at: v })} /></div>
                <div className="space-y-1.5"><Label htmlFor="p-t">Tempo de preparo (min)</Label><Input id="p-t" type="number" min={0} value={form.prep_time_minutes} onChange={(e) => setForm({ ...form, prep_time_minutes: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label htmlFor="p-o">Ordem de exibição</Label><Input id="p-o" type="number" min={0} value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {([["is_active", "Ativo no cardápio"], ["is_featured", "Destaque"], ["is_best_seller", "Mais vendido"], ["is_new", "Novo"]] as const).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2"><Switch checked={form[k]} onCheckedChange={(v) => setForm({ ...form, [k]: v })} />{label}</label>
                ))}
              </div>
              <div className="space-y-1.5"><Label>Imagem</Label><ImageUploader value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} /></div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={save.isPending} onClick={() => save.mutate(form)}>{save.isPending ? "Salvando..." : "Salvar produto"}</Button>
                {form.id ? <Button variant="outline" onClick={() => setArchiving(data.find((p) => p.id === form.id) ?? null)}><Archive className="mr-1 h-4 w-4" />Arquivar</Button> : null}
              </div>
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Adicionais e personalização</h3>
                {form.id ? <OptionGroupsEditor productId={form.id} /> : <p className="text-sm text-muted-foreground">Salve o produto para cadastrar adicionais.</p>}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={Boolean(archiving)} onOpenChange={(o) => !o && setArchiving(null)} title="Arquivar produto"
        description="O produto sai do cardápio, mas continua no histórico de pedidos e relatórios." confirmLabel="Arquivar" destructive
        loading={archive.isPending} onConfirm={() => archiving && archive.mutate(archiving.id)} />
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Admin Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: ProductsPage,
});
