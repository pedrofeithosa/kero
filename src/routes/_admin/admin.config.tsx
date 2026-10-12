import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsService, type StoreHour, type StoreSettings } from "@/services/admin/SettingsService";
import { ActivityLogService, ACTION_LABELS } from "@/services/admin/ActivityLogService";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

type Draft = Partial<StoreSettings>;

function Field({ label, k, draft, set, textarea }: { label: string; k: keyof StoreSettings; draft: Draft; set: (d: Draft) => void; textarea?: boolean }) {
  const value = (draft[k] as string | null | undefined) ?? "";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`cfg-${k}`}>{label}</Label>
      {textarea ? <Textarea id={`cfg-${k}`} rows={3} value={value} onChange={(e) => set({ ...draft, [k]: e.target.value })} />
        : <Input id={`cfg-${k}`} value={value} onChange={(e) => set({ ...draft, [k]: e.target.value })} />}
    </div>
  );
}

function HourRow({ hour }: { hour: StoreHour }) {
  const qc = useQueryClient();
  const update = async (input: Partial<StoreHour>) => {
    try { await SettingsService.updateHour(hour.id, input); await qc.invalidateQueries({ queryKey: ["admin", "hours"] }); }
    catch (e) { toast.error((e as Error).message); }
  };
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3 rounded-xl border p-3 sm:grid-cols-[120px_auto_1fr_1fr]">
      <span className="font-medium">{WEEKDAYS[hour.weekday]}</span>
      <label className="flex items-center gap-2 text-sm"><Switch checked={!hour.is_closed} onCheckedChange={(v) => void update({ is_closed: !v })} />{hour.is_closed ? "Fechado" : "Aberto"}</label>
      <Input type="time" disabled={hour.is_closed} defaultValue={hour.opens_at.slice(0, 5)} aria-label="Abre às" onBlur={(e) => void update({ opens_at: e.target.value })} />
      <Input type="time" disabled={hour.is_closed} defaultValue={hour.closes_at.slice(0, 5)} aria-label="Fecha às" onBlur={(e) => void update({ closes_at: e.target.value })} />
    </div>
  );
}

function ConfigPage() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: SettingsService.get });
  const { data: hours = [] } = useQuery({ queryKey: ["admin", "hours"], queryFn: SettingsService.hours });
  const { data: logs = [] } = useQuery({ queryKey: ["admin", "logs"], queryFn: () => ActivityLogService.list(100) });
  const [draft, setDraft] = React.useState<Draft>({});
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if (settings) setDraft(settings); }, [settings]);

  async function save() {
    if (!draft.company_name || draft.company_name.trim().length < 2) return toast.error("Informe o nome da empresa.");
    if (!draft.pay_pix && !draft.pay_cash && !draft.pay_card_on_delivery && !draft.pay_online) return toast.error("Mantenha ao menos uma forma de pagamento ativa.");
    setSaving(true);
    try {
      const { id: _id, updated_at: _u, ...rest } = draft as StoreSettings;
      await SettingsService.update(rest);
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Configurações salvas.");
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }

  const saveBar = <div className="flex justify-end pt-2"><Button onClick={() => void save()} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button></div>;

  return (
    <AdminShell permission="settings.manage">
      <SectionTitle eyebrow="Ajustes" title="Configurações" />
      {isLoading ? <Skeleton className="mt-6 h-96 rounded-2xl" /> : (
        <Tabs defaultValue="empresa" className="mt-6">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="loja">Status da loja</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa" className="space-y-4 rounded-2xl border bg-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome da empresa" k="company_name" draft={draft} set={setDraft} />
              <Field label="Telefone" k="phone" draft={draft} set={setDraft} />
              <Field label="Instagram" k="instagram" draft={draft} set={setDraft} />
              <div className="space-y-1.5"><Label htmlFor="cfg-prep">Tempo médio de preparo (min)</Label><Input id="cfg-prep" type="number" min={5} value={draft.avg_prep_minutes ?? 30} onChange={(e) => setDraft({ ...draft, avg_prep_minutes: Number(e.target.value) })} /></div>
              <Field label="Rua" k="street" draft={draft} set={setDraft} />
              <Field label="Número" k="number" draft={draft} set={setDraft} />
              <Field label="Bairro" k="district" draft={draft} set={setDraft} />
              <Field label="Cidade" k="city" draft={draft} set={setDraft} />
              <Field label="Estado" k="state" draft={draft} set={setDraft} />
              <Field label="CEP" k="zip" draft={draft} set={setDraft} />
            </div>
            <Field label="Descrição" k="description" draft={draft} set={setDraft} textarea />
            <Field label="Mensagem exibida após o pedido" k="order_message" draft={draft} set={setDraft} textarea />
            {saveBar}
          </TabsContent>

          <TabsContent value="horarios" className="space-y-3 rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Usado pelo site e pelo checkout para aceitar pedidos. Alterações são salvas automaticamente.</p>
            {hours.map((h) => <HourRow key={h.id} hour={h} />)}
          </TabsContent>

          <TabsContent value="loja" className="space-y-4 rounded-2xl border bg-card p-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {([["auto", "Automático"], ["open", "Aberta"], ["closed", "Fechada"], ["paused", "Pausar pedidos"]] as const).map(([v, label]) => (
                <Button key={v} variant={draft.store_state === v ? "default" : "outline"} onClick={() => setDraft({ ...draft, store_state: v })}>{label}</Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">“Automático” segue os horários de funcionamento.</p>
            <Field label="Mensagem quando pausado/fechado" k="paused_message" draft={draft} set={setDraft} textarea />
            {saveBar}
          </TabsContent>

          <TabsContent value="pagamentos" className="space-y-4 rounded-2xl border bg-card p-5">
            {([["pay_pix", "PIX"], ["pay_cash", "Dinheiro"], ["pay_card_on_delivery", "Cartão na entrega"], ["pay_online", "Pagamento online (gateway futuro)"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between rounded-xl border p-3 text-sm">{label}<Switch checked={Boolean(draft[k])} onCheckedChange={(v) => setDraft({ ...draft, [k]: v })} /></label>
            ))}
            {saveBar}
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4 rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">O WhatsApp é um canal complementar. O fluxo principal continua sendo Cardápio → Carrinho → Checkout.</p>
            <Field label="Número do WhatsApp (com DDD)" k="whatsapp" draft={draft} set={setDraft} />
            <Field label="Mensagem automática" k="whatsapp_auto_message" draft={draft} set={setDraft} textarea />
            <Field label="Mensagem de suporte" k="whatsapp_support_message" draft={draft} set={setDraft} textarea />
            <Field label="Mensagem de pedido" k="whatsapp_order_message" draft={draft} set={setDraft} textarea />
            {saveBar}
          </TabsContent>

          <TabsContent value="atividades" className="rounded-2xl border bg-card p-5">
            {logs.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p> : (
              <ul className="divide-y text-sm">
                {logs.map((l) => (
                  <li key={l.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
                    <span><span className="font-medium">{l.actor_name ?? "Sistema"}</span> {ACTION_LABELS[l.action] ?? l.action}</span>
                    <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      )}
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/config")({
  head: () => ({ meta: [{ title: "Configurações — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ConfigPage,
});
