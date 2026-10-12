import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/promocoes")({
  head: () => ({
    meta: [
      { title: "Promoções — Kero Mais" },
      { name: "description", content: "Ofertas e combos especiais da Kero Mais." },
      { property: "og:title", content: "Promoções — Kero Mais" },
      { property: "og:description", content: "Combos e descontos por tempo limitado." },
    ],
  }),
  component: () => (
    <PublicShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
        <SectionTitle eyebrow="Ofertas" title="Promoções da semana" />
        <EmptyState title="Promoções em construção" />
      </div>
    </PublicShell>
  ),
});
