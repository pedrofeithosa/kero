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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsService, type DeliveryZone } from "@/services/admin/SettingsService";

interface Form { id?: string; district: string; city: string; fee: number | null; eta_minutes: number; is_active: boolean }

function DeliveryPage() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin", "zones"], queryFn: SettingsService.zones });
  const [form, setForm] = React.useState<Form | null>(null);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      if (f.district.trim().length < 2 || f.city.trim().length < 2) throw new Error("Informe bairro e cidade.");
      if (f.fee == null || f.fee < 0) throw new Error("Informe uma taxa válida.");
      if (f.eta_minutes < 5) throw new Error("O tempo estimado deve ser de pelo menos 5 minutos.");
      const payload = { district: f.district.trim(), city: f.city.trim(), fee: f.fee, eta_minutes: f.eta_minutes };
      if (f.id) await SettingsService.updateZone(f.id, { ...payload, is_active: f.is_active });
      else await SettingsService.createZone(payload);
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["admin", "zones"] }); setForm(null); toast.success("Zona salva."); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function toggle(z: DeliveryZone) {
    try { await SettingsService.updateZone(z.id, { is_active: !z.is_active }); await qc.invalidateQueries({ queryKey: ["admin", "zones"] }); }
    catch (e) { toast.error((e as Error).message); }
  }

  const edit = (z: DeliveryZone) => setForm({ id: z.id, district: z.district, city: z.city, fee: z.fee, eta_minutes: z.eta_minutes, is_active: z.is_active });

  return (
    <AdminShell permission="delivery.manage">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Logística" title="Zonas de entrega" />
        <Button onClick={() => setForm({ district: "", city: "", fee: null, eta_minutes: 40, is_active: true })}><Plus className="mr-1 h-4 w-4" />Nova zona</Button>
      </div>
      <div className="mt-6">
        <DataTable rows={data} loading={isLoading} error={error ? (error as Error).message : null} rowKey={(r) => r.id} onRowClick={edit}
          emptyTitle="Nenhuma zona cadastrada" emptyDescription="Sem zonas, o checkout não aceita entregas."
          columns={[
            { key: "b", header: "Bairro", render: (r) => <span className="font-medium">{r.district}</span> },
            { key: "c", header: "Cidade", render: (r) => r.city },
            { key: "f", header: "Taxa", render: (r) => formatBRL(r.fee) },
            { key: "t", header: "Tempo", render: (r) => `${r.eta_minutes} min` },
            { key: "a", header: "Ativa", render: (r) => <span onClick={(e) => e.stopPropagation()}><Switch checked={r.is_active} onCheckedChange={() => void toggle(r)} aria-label="Ativar zona" /></span> },
          ]}
          mobileCard={(r) => (
            <div className="flex justify-between gap-3">
              <div><p className="font-medium">{r.district}</p><p className="text-xs text-muted-foreground">{r.city} · {r.eta_minutes} min</p></div>
              <div className="text-right"><p className="font-medium">{formatBRL(r.fee)}</p><p className="text-xs text-muted-foreground">{r.is_active ? "Ativa" : "Inativa"}</p></div>
            </div>
          )}
        />
      </div>
      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form?.id ? "Editar zona" : "Nova zona"}</DialogTitle></DialogHeader>
          {form ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="z-d">Bairro</Label><Input id="z-d" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="z-c">Cidade</Label><Input id="z-c" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Taxa</Label><PriceInput value={form.fee} onChange={(v) => setForm({ ...form, fee: v })} /></div>
              <div className="space-y-1.5"><Label htmlFor="z-t">Tempo estimado (min)</Label><Input id="z-t" type="number" min={5} value={form.eta_minutes} onChange={(e) => setForm({ ...form, eta_minutes: Number(e.target.value) })} /></div>
              {form.id ? <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />Ativa</label> : null}
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

export const Route = createFileRoute("/_admin/admin/entrega")({
  head: () => ({ meta: [{ title: "Entrega — Admin" }, { name: "robots", content: "noindex" }] }),
  component: DeliveryPage,
});
