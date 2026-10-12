import { createFileRoute } from "@tanstack/react-router";
import { AccountShell } from "@/components/layout/AccountShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/_authenticated/conta/pedidos")({
  head: () => ({ meta: [{ title: "Meus pedidos — Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AccountShell>
      <SectionTitle eyebrow="Histórico" title="Meus pedidos" />
      <div className="mt-6">
        <EmptyState title="Nenhum pedido ainda" description="Seus pedidos aparecerão aqui." />
      </div>
    </AccountShell>
  ),
});
