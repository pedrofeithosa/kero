import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DataTable } from "@/components/admin/DataTable";
import { PriceInput, formatBRL } from "@/components/admin/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CouponAdminService, type CouponRow } from "@/services/admin/CouponAdminService";

type CType = "percent" | "fixed" | "free_shipping";
const TYPE_LABELS: Record<CType, string> = { percent: "Percentual", fixed: "Valor fixo", free_shipping: "Frete grátis" };

interface Form {
  id?: string; code: string; description: string; discount_type: CType; discount_value: number | null;
  min_order_total: number | null; max_uses: string; max_uses_per_customer: string; starts_at: string; ends_at: string; is_active: boolean;
}

const toLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : "");
const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
const toInt = (v: string) => (v.trim() === "" ? null : Math.max(1, Math.floor(Number(v))));

function couponState(c: CouponRow) {
  if (!c.is_active) return { label: "Inativo", variant: "muted" as const };
  const now = Date.now();
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return { label: "Agendado", variant: "info" as const };
  if (c.ends_at && new Date(c.ends_at).getTime() < now) return { label: "Expirado", variant: "muted" as const };
  if (c.max_uses && c.uses_count >= c.max_uses) return { label: "Esgotado", variant: "warning" as const };
  return { label: "Ativo", variant: "success" as const };
}

function CouponsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin", "coupons"], queryFn: CouponAdminService.list });
  const [form, setForm] = React.useState<Form | null>(null);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const code = f.code.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,20}$/.test(code)) throw new Error("Código deve ter 3 a 20 letras, números, - ou _.");
      if (f.discount_type !== "free_shipping" && (!f.discount_value || f.discount_value <= 0)) throw new Error("Informe o valor do desconto.");
      if (f.discount_type === "percent" && (f.discount_value ?? 0) > 100) throw new Error("O percentual não pode passar de 100%.");
      if (f.starts_at && f.ends_at && new Date(f.ends_at) <= new Date(f.starts_at)) throw new Error("A data final deve ser depois da inicial.");
      const payload = {
        code, description: f.description || null, discount_type: f.discount_type,
        discount_value: f.discount_type === "free_shipping" ? 0 : f.discount_value!, min_order_total: f.min_order_total ?? 0,
        max_uses: toInt(f.max_uses), max_uses_per_customer: toInt(f.max_uses_per_customer),
        starts_at: toIso(f.starts_at), ends_at: toIso(f.ends_at), is_active: f.is_active,
      };
      if (f.id) await CouponAdminService.update(f.id, payload);
      else await CouponAdminService.create(payload);
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); setForm(null); toast.success("Cupom salvo."); },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "Já existe um cupom com esse código." : e.message),
  });

  const edit = (c: CouponRow) => setForm({
    id: c.id, code: c.code, description: c.description ?? "", discount_type: c.discount_type, discount_value: c.discount_value,
    min_order_total: c.min_order_total, max_uses: c.max_uses?.toString() ?? "", max_uses_per_customer: c.max_uses_per_customer?.toString() ?? "",
    starts_at: toLocal(c.starts_at), ends_at: toLocal(c.ends_at), is_active: c.is_active,
  });
  const valueLabel = (c: CouponRow) => c.discount_type === "percent" ? `${c.discount_value}%` : c.discount_type === "fixed" ? formatBRL(c.discount_value) : "Frete grátis";

  return (
    <AdminShell permission="coupons.manage">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Marketing" title="Cupons" />
        <Button onClick={() => setForm({ code: "", description: "", discount_type: "percent", discount_value: 10, min_order_total: 0, max_uses: "", max_uses_per_customer: "1", starts_at: "", ends_at: "", is_active: true })}>
          <Plus className="mr-1 h-4 w-4" />Novo cupom
        </Button>
      </div>
      <div className="mt-6">
        <DataTable rows={data} loading={isLoading} error={error ? (error as Error).message : null} rowKey={(r) => r.id} onRowClick={edit}
          emptyTitle="Nenhum cupom cadastrado"
          columns={[
            { key: "c", header: "Código", render: (r) => <span className="font-mono font-semibold">{r.code}</span> },
            { key: "t", header: "Desconto", render: valueLabel },
            { key: "m", header: "Mínimo", render: (r) => formatBRL(r.min_order_total) },
            { key: "u", header: "Usos", render: (r) => `${r.uses_count}${r.max_uses ? ` / ${r.max_uses}` : ""}` },
            { key: "s", header: "Status", render: (r) => { const s = couponState(r); return <Badge variant={s.variant}>{s.label}</Badge>; } },
          ]}
          mobileCard={(r) => { const s = couponState(r); return (
            <div className="flex justify-between gap-3">
              <div><p className="font-mono font-semibold">{r.code}</p><p className="text-xs text-muted-foreground">{valueLabel(r)} · {r.uses_count} uso(s)</p></div>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
          ); }}
        />
      </div>
      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form?.id ? "Editar cupom" : "Novo cupom"}</DialogTitle></DialogHeader>
          {form ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="cp-code">Código</Label><Input id="cp-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="KERO10" /></div>
              <div className="space-y-1.5"><Label>Tipo</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as CType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(TYPE_LABELS) as CType[]).map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.discount_type === "percent" ? (
                <div className="space-y-1.5"><Label htmlFor="cp-p">Percentual (%)</Label><Input id="cp-p" type="number" min={1} max={100} value={form.discount_value ?? ""} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} /></div>
              ) : form.discount_type === "fixed" ? (
                <div className="space-y-1.5"><Label>Valor</Label><PriceInput value={form.discount_value} onChange={(v) => setForm({ ...form, discount_value: v })} /></div>
              ) : null}
              <div className="space-y-1.5"><Label>Pedido mínimo</Label><PriceInput value={form.min_order_total} onChange={(v) => setForm({ ...form, min_order_total: v })} /></div>
              <div className="space-y-1.5"><Label htmlFor="cp-mu">Limite total de usos</Label><Input id="cp-mu" type="number" min={1} placeholder="Ilimitado" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="cp-mc">Usos por cliente</Label><Input id="cp-mc" type="number" min={1} placeholder="Ilimitado" value={form.max_uses_per_customer} onChange={(e) => setForm({ ...form, max_uses_per_customer: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="cp-s">Início</Label><Input id="cp-s" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="cp-e">Fim</Label><Input id="cp-e" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="cp-d">Descrição</Label><Input id="cp-d" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />Ativo</label>
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

export const Route = createFileRoute("/_admin/admin/cupons")({
  head: () => ({ meta: [{ title: "Cupons — Admin" }, { name: "robots", content: "noindex" }] }),
  component: CouponsPage,
});
