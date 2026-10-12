import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Archive } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DataTable } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CatalogService, type CategoryRow } from "@/services/admin/CatalogService";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface FormState { id?: string; name: string; description: string; image_url: string | null; is_active: boolean }
const EMPTY: FormState = { name: "", description: "", image_url: null, is_active: true };

function CategoriesPage() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin", "categories"], queryFn: () => CatalogService.listCategories() });
  const [form, setForm] = React.useState<FormState | null>(null);
  const [archiving, setArchiving] = React.useState<CategoryRow | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "categories"] });

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      if (f.name.trim().length < 2) throw new Error("Informe o nome da categoria (mínimo 2 caracteres).");
      const payload = { name: f.name.trim(), description: f.description || null, image_url: f.image_url, is_active: f.is_active };
      if (f.id) return CatalogService.updateCategory(f.id, payload);
      return CatalogService.createCategory({ ...payload, slug: slugify(f.name), position: data.length + 1 });
    },
    onSuccess: async () => { await refresh(); setForm(null); toast.success("Categoria salva."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => CatalogService.archiveCategory(id),
    onSuccess: async () => { await refresh(); setArchiving(null); toast.success("Categoria removida do cardápio."); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function move(index: number, dir: -1 | 1) {
    const ids = data.map((c) => c.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    await CatalogService.reorderCategories(ids);
    await refresh();
  }

  async function toggle(c: CategoryRow) {
    try { await CatalogService.updateCategory(c.id, { is_active: !c.is_active }); await refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }

  const actions = (c: CategoryRow, i: number) => (
    <div className="flex items-center justify-end gap-1">
      <Button size="icon" variant="ghost" aria-label="Subir" onClick={(e) => { e.stopPropagation(); void move(i, -1); }}><ArrowUp className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" aria-label="Descer" onClick={(e) => { e.stopPropagation(); void move(i, 1); }}><ArrowDown className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => setForm({ id: c.id, name: c.name, description: c.description ?? "", image_url: c.image_url, is_active: c.is_active })}><Pencil className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => setArchiving(c)}><Archive className="h-4 w-4" /></Button>
    </div>
  );

  return (
    <AdminShell permission="categories.manage">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Cardápio" title="Categorias" />
        <Button onClick={() => setForm(EMPTY)}><Plus className="mr-1 h-4 w-4" />Nova categoria</Button>
      </div>
      <div className="mt-6">
        <DataTable
          rows={data} loading={isLoading} error={error ? (error as Error).message : null} rowKey={(r) => r.id}
          emptyTitle="Nenhuma categoria cadastrada"
          columns={[
            { key: "p", header: "#", render: (r) => r.position },
            { key: "n", header: "Nome", render: (r) => <span className="font-medium">{r.name}</span> },
            { key: "a", header: "Ativa", render: (r) => <Switch checked={r.is_active} onCheckedChange={() => void toggle(r)} aria-label="Ativar categoria" /> },
            { key: "x", header: "", className: "text-right", render: (r) => actions(r, data.indexOf(r)) },
          ]}
          mobileCard={(r) => (
            <div className="flex items-center justify-between gap-3">
              <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.is_active ? "Ativa" : "Inativa"}</p></div>
              {actions(r, data.indexOf(r))}
            </div>
          )}
        />
      </div>

      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form?.id ? "Editar categoria" : "Nova categoria"}</DialogTitle></DialogHeader>
          {form ? (
            <div className="space-y-4">
              <div className="space-y-1.5"><Label htmlFor="cat-name">Nome</Label><Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="cat-desc">Descrição</Label><Textarea id="cat-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Imagem</Label><ImageUploader folder="categorias" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />Ativa no cardápio</label>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancelar</Button>
            <Button disabled={save.isPending} onClick={() => form && save.mutate(form)}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={Boolean(archiving)} onOpenChange={(o) => !o && setArchiving(null)} title="Excluir categoria"
        description="A categoria sai do cardápio. Os produtos e o histórico de vendas são preservados." destructive
        confirmLabel="Excluir" loading={archive.isPending} onConfirm={() => archiving && archive.mutate(archiving.id)} />
    </AdminShell>
  );
}

export const Route = createFileRoute("/_admin/admin/categorias")({
  head: () => ({ meta: [{ title: "Categorias — Admin" }, { name: "robots", content: "noindex" }] }),
  component: CategoriesPage,
});
