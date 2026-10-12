import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { StoreHoursList } from "@/components/shared/StoreHoursList";
import { Button } from "@/components/ui/button";
import {
  ADDRESS_LINE,
  BUSINESS,
  MAPS_DIRECTIONS_URL,
  MAPS_EMBED_URL,
  TEL_URL,
  whatsappUrl,
} from "@/lib/business";

const WHATSAPP_MESSAGE = "Olá! Preciso de ajuda com a Kero Mais.";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Kero Mais" },
      {
        name: "description",
        content: `Fale com a Kero Mais: ${ADDRESS_LINE}. Telefone e WhatsApp ${BUSINESS.phoneDisplay}.`,
      },
      { property: "og:title", content: "Contato — Kero Mais" },
      { property: "og:description", content: "Atendimento, WhatsApp e endereço." },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <PublicShell>
      <div className="container-page space-y-8 py-16">
        <SectionTitle
          eyebrow="Fale conosco"
          title="Estamos por aqui"
          description="Venha nos visitar ou chame no WhatsApp. Para fazer seu pedido, use o cardápio do site."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-card border border-border bg-card p-5 shadow-card">
              <p className="flex items-center gap-2 font-display text-h5 font-bold">
                <MapPin className="size-5 text-primary" aria-hidden /> Endereço
              </p>
              <address className="mt-2 text-body not-italic text-muted-foreground">
                {BUSINESS.address.street}
                <br />
                {BUSINESS.address.district} — {BUSINESS.address.city}/{BUSINESS.address.state}
              </address>
              <Button asChild variant="outline" className="mt-4">
                <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                  <Navigation aria-hidden /> Como chegar
                </a>
              </Button>
            </div>

            <div className="rounded-card border border-border bg-card p-5 shadow-card">
              <p className="flex items-center gap-2 font-display text-h5 font-bold">
                <Phone className="size-5 text-primary" aria-hidden /> Telefone e WhatsApp
              </p>
              <p className="mt-2 text-body text-muted-foreground">
                <a href={TEL_URL} className="font-semibold text-foreground hover:underline">
                  {BUSINESS.phoneDisplay}
                </a>
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="whatsapp">
                  <a href={whatsappUrl(WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden /> Chamar no WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={TEL_URL}>
                    <Phone aria-hidden /> Ligar agora
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-card border border-border bg-card p-5 shadow-card">
              <p className="flex items-center gap-2 font-display text-h5 font-bold">
                <Clock className="size-5 text-primary" aria-hidden /> Horário de funcionamento
              </p>
              <StoreHoursList className="mt-2 text-body text-muted-foreground" />
            </div>
          </div>

          <div className="overflow-hidden rounded-card border border-border shadow-card">
            <iframe
              title="Mapa da Kero Mais em Pedreira"
              src={MAPS_EMBED_URL}
              loading="lazy"
              className="h-80 w-full lg:h-full lg:min-h-96"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
