import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { SectionTitle } from "@/components/shared/SectionTitle";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Kero Mais" },
      { name: "description", content: "Conheça a história da Kero Mais." },
      { property: "og:title", content: "Sobre — Kero Mais" },
      { property: "og:description", content: "A lanchonete que virou paixão de bairro." },
    ],
  }),
  component: () => (
    <PublicShell>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-16">
        <SectionTitle eyebrow="Nossa história" title="A Kero Mais nasceu do sabor" />
        <p className="text-lg text-muted-foreground">
          Conteúdo em construção. Aqui contaremos a jornada da marca, os valores e a
          equipe por trás de cada pedido.
        </p>
      </div>
    </PublicShell>
  ),
});
