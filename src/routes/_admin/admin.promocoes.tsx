import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DataTable } from "@/components/admin/DataTable";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PriceInput, formatBRL } from "@/components/admin/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PromotionService, promotionStatus, type PromotionRow } from "@/services/admin/PromotionService";
import { CatalogService } from "@/services/admin/CatalogService";

interface Form {
  id?: string; title: string; description: string; image_url: string | null; product_id: string; category_id: string;
  promo_price: number | null; discount_percent: string; starts_at: string; ends_at: string; usage_limit: string; is_active: boolean;
}
const NONE = "none";
const toLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : "");
const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
const toneVariant = { success: "success", info: "info", muted: "muted" } as const;

function PromotionsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin", "promotions"], queryFn: PromotionService.list });
  const { data: products = [] } = useQuery({ queryKey: ["admin", "products", "all"], queryFn: () => CatalogService.listProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["admin", "categories"], queryFn: () => CatalogService.listCategories() });
  const [form, setForm] = React.useState<Form | null>(null);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      if (f.title.trim().length < 3) throw new Error("Informe o título da promoção.");
      const pct = f.discount_percent ? Number(f.discount_percent) : null;
      if (pct !== null && (pct <= 0 || pct > 100)) throw new Error("Desconto deve estar entre 1% e 100%.");
      if (f.starts_at && f.ends_at && new Date(f.ends_at) <= new Date(f.starts_at)) throw new Error("A data final deve ser depois da inicial.");
      const payload = {
        title: f.title.trim(), description: f.description || null, image_url: f.image_url,
        product_id: f.product_id === NONE ? null : f.product_id, category_id: f.category_id === NONE ? null : f.category_id,
        promo_price: f.promo_price, discount_percent: pct, starts_at: toIso(f.starts_at), ends_at: toIso(f.ends_at),
        usage_limit: f.usage_limit ? Math.max(1, Number(f.usage_limit)) : null, is_active: f.is_active,
      };
      if (f.id) await PromotionService.update(f.id, payload);
      else await PromotionService.create(payload);
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["admin", "promotions"] }); setForm(null); toast.success("Promoção salva."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const edit = (p: PromotionRow) => setForm({
    id: p.id, title: p.title, description: p.description ?? "", image_url: p.image_url, product_id: p.product_id ?? NONE,
    category_id: p.category_id ?? NONE, promo_price: p.promo_price, discount_percent: p.discount_percent?.toString() ?? "",
    starts_at: toLocal(p.starts_at), ends_at: toLocal(p.ends_at), usage_limit: p.usage_limit?.toString() ?? "", is_active: p.is_active,
  });

  const offer = (p: PromotionRow) => p.promo_price != null ? formatBRL(p.promo_price) : p.discount_percent != null ? `${p.discount_percent}% off` : "—";

  return (
    <AdminShell permission="promotions.manage">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Marketing" title="Promoções" />
        <Button onClick={() => setForm({ title: "", description: "", image_url: null, product_id: NONE, category_id: NONE, promo_price: null, discount_percent: "", starts_at: "", ends_at: "", usage_limit: "", is_active: true })}>
          <Plus className="mr-1 h-4 w-4" />Nova promoção
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Promoções agendadas aparecem no site apenas a partir da data de início e saem automaticamente ao expirar.</p>
      <div className="mt-6">
        <DataTable rows={data} loading={isLoading} error={error ? (error as Error).message : null} rowKey={(r) => r.id} onRowClick={edit}
          emptyTitle="Nenhuma promoção cadastrada"
          columns={[
            { key: "t", header: "Título", render: (r) => <span className="font-medium">{r.title}</span> },
            { key: "a", header: "Aplica em", render: (r) => r.products?.name ?? r.categories?.name ?? "Geral" },
            { key: "o", header: "Oferta", render: offer },
            { key: "p", header: "Período", render: (r) => `${r.starts_at ? new Date(r.starts_at).toLocaleDateString("pt-BR") : "—"} → ${r.ends_at ? new Date(r.ends_at).toLocaleDateString("pt-BR") : "—"}` },
            { key: "s", header: "Status", render: (r) => { const s = promotionStatus(r); return <Badge variant={toneVariant[s.tone]}>{s.label}</Badge>; } },
          ]}
          mobileCard={(r) => { const s = promotionStatus(r); return (
            <div className="flex justify-between gap-3"><div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{offer(r)}</p></div><Badge variant={toneVariant[s.tone]}>{s.label}</Badge></div>
          ); }}
        />
      </div>
      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form?.id ? "Editar promoção" : "Nova promoção"}</DialogTitle></DialogHeader>
          {form ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="pr-t">Título</Label><Input id="pr-t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="pr-d">Descrição</Label><Textarea id="pr-d" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Produto</Label>
                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={NONE}>Nenhum</SelectItem>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Categoria</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={NONE}>Nenhuma</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Preço promocional</Label><PriceInput value={form.promo_price} onChange={(v) => setForm({ ...form, promo_price: v })} /></div>
              <div className="space-y-1.5"><Label htmlFor="pr-p">ou desconto (%)</Label><Input id="pr-p" type="number" min={1} max={100} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="pr-s">Início</Label><Input id="pr-s" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="pr-e">Fim</Label><Input id="pr-e" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="pr-l">Limite de uso</Label><Input id="pr-l" type="number" min={1} placeholder="Ilimitado" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} /></div>
              <label className="flex items-center gap-2 self-end text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />Ativa</label>
              <div className="space-y-1.5 sm:col-span-2"><Label>Banner</Label><ImageUploader folder="promocoes" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} /></div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancelar</Button>
            <Button disabled={save.isPending} onClick={() => form && save.mutate(form)}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/promocoes")({
  head: () => ({ meta: [{ title: "Promoções — Admin" }, { name: "robots", content: "noindex" }] }),
  component: PromotionsPage,
});
