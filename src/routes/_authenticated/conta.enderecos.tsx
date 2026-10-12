import { createFileRoute } from "@tanstack/react-router";
import { AccountShell } from "@/components/layout/AccountShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/_authenticated/conta/enderecos")({
  head: () => ({ meta: [{ title: "Endereços — Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AccountShell>
      <SectionTitle eyebrow="Entrega" title="Meus endereços" />
      <div className="mt-6">
        <EmptyState title="Endereços em construção" />
      </div>
    </AccountShell>
  ),
});
