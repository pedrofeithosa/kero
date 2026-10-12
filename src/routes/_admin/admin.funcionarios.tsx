import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeeService, type EmployeeRow } from "@/services/admin/EmployeeService";
import { ROLE_LABELS, STAFF_ROLES, type StaffRole } from "@/features/admin/permissions";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { createEmployee } from "@/lib/admin-users.functions";

function RoleSelect({ value, onChange, disabled }: { value: StaffRole; onChange: (r: StaffRole) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as StaffRole)} disabled={disabled}>
      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
      <SelectContent>{STAFF_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function EmployeesPage() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const create = useServerFn(createEmployee);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin", "employees"], queryFn: EmployeeService.list });
  const [form, setForm] = React.useState<{ name: string; email: string; phone: string; password: string; role: StaffRole } | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "employees"] });

  const save = useMutation({
    mutationFn: async () => {
      if (!form) return;
      if (form.name.trim().length < 2) throw new Error("Informe o nome.");
      if (form.password.length < 8) throw new Error("A senha inicial deve ter pelo menos 8 caracteres.");
      await create({ data: { ...form, phone: form.phone || undefined } });
    },
    onSuccess: async () => { await refresh(); setForm(null); toast.success("Funcionário cadastrado."); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function changeRole(e: EmployeeRow, role: StaffRole) {
    try { await EmployeeService.setRole(e.id, role); await refresh(); toast.success("Função atualizada."); }
    catch (err) { toast.error((err as Error).message); }
  }
  async function toggle(e: EmployeeRow) {
    try { await EmployeeService.update(e.id, { is_active: !e.is_active }); await refresh(); }
    catch (err) { toast.error((err as Error).message); }
  }

  const isSelf = (e: EmployeeRow) => e.id === user?.id;
  const lastSeen = (e: EmployeeRow) => (e.last_seen_at ? new Date(e.last_seen_at).toLocaleString("pt-BR") : "Nunca acessou");

  return (
    <AdminShell permission="employees.manage">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Equipe" title="Funcionários" />
        <Button onClick={() => setForm({ name: "", email: "", phone: "", password: "", role: "attendant" })}><Plus className="mr-1 h-4 w-4" />Novo funcionário</Button>
      </div>
      <div className="mt-6">
        <DataTable rows={data} loading={isLoading} error={error ? (error as Error).message : null} rowKey={(r) => r.id}
          emptyTitle="Nenhum funcionário cadastrado"
          columns={[
            { key: "n", header: "Nome", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
            { key: "r", header: "Função", render: (r) => <RoleSelect value={r.roles[0] ?? "attendant"} disabled={isSelf(r)} onChange={(role) => void changeRole(r, role)} /> },
            { key: "l", header: "Último acesso", render: lastSeen },
            { key: "a", header: "Ativo", render: (r) => <Switch checked={r.is_active} disabled={isSelf(r)} onCheckedChange={() => void toggle(r)} aria-label="Ativar funcionário" /> },
          ]}
          mobileCard={(r) => (
            <div className="space-y-3">
              <div className="flex justify-between gap-3"><div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{lastSeen(r)}</p></div>
                <Badge variant={r.is_active ? "success" : "muted"}>{r.is_active ? "Ativo" : "Inativo"}</Badge></div>
              <div className="flex items-center justify-between gap-3">
                <RoleSelect value={r.roles[0] ?? "attendant"} disabled={isSelf(r)} onChange={(role) => void changeRole(r, role)} />
                <Switch checked={r.is_active} disabled={isSelf(r)} onCheckedChange={() => void toggle(r)} aria-label="Ativar funcionário" />
              </div>
            </div>
          )}
        />
      </div>
      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo funcionário</DialogTitle></DialogHeader>
          {form ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="e-n">Nome</Label><Input id="e-n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="e-e">E-mail de acesso</Label><Input id="e-e" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="e-p">Telefone</Label><Input id="e-p" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="e-s">Senha inicial</Label><Input id="e-s" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Função</Label><RoleSelect value={form.role} onChange={(role) => setForm({ ...form, role })} /></div>
              <p className="text-xs text-muted-foreground sm:col-span-2">A senha é guardada com segurança pelo sistema de login — o painel nunca a armazena.</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancelar</Button>
            <Button disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Salvando..." : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/funcionarios")({
  head: () => ({ meta: [{ title: "Funcionários — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EmployeesPage,
});
