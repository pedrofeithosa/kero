import { createFileRoute } from "@tanstack/react-router";
import { AccountShell } from "@/components/layout/AccountShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/_authenticated/conta/")({
  head: () => ({ meta: [{ title: "Minha conta — Kero Mais" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AccountShell>
      <SectionTitle eyebrow="Perfil" title="Minha conta" />
      <div className="mt-6">
        <EmptyState title="Perfil em construção" />
      </div>
    </AccountShell>
  ),
});
