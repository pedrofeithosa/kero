import { Link } from "@tanstack/react-router";
import { Clock, Instagram, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { StoreHoursList } from "@/components/shared/StoreHoursList";
import {
  ADDRESS_LINE,
  BUSINESS,
  MAPS_DIRECTIONS_URL,
  MAPS_EMBED_URL,
  TEL_URL,
  whatsappUrl,
} from "@/lib/business";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary text-secondary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo variant="light" />
          <p className="text-small text-secondary-foreground/70">
            Hambúrgueres, hot dogs, combos e bebidas preparados na hora, com ingredientes
            selecionados e entrega rápida em Pedreira.
          </p>
          <div className="flex gap-2">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp da Kero Mais"
              className="inline-flex size-10 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground transition-transform hover:scale-105"
            >
              <MessageCircle className="size-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Kero Mais"
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-secondary-foreground transition-transform hover:scale-105"
            >
              <Instagram className="size-5" />
            </a>
          </div>
        </div>

        <FooterCol
          title="Links rápidos"
          links={[
            { to: "/cardapio", label: "Cardápio" },
            { to: "/promocoes", label: "Promoções" },
            { to: "/sobre", label: "Sobre nós" },
            { to: "/contato", label: "Contato" },
            { to: "/conta/pedidos", label: "Meus pedidos" },
          ]}
        />

        <FooterCol
          title="Categorias"
          links={[
            { to: "/cardapio", label: "Hambúrgueres" },
            { to: "/cardapio", label: "Hot Dogs" },
            { to: "/cardapio", label: "Combos" },
            { to: "/cardapio", label: "Bebidas" },
            { to: "/promocoes", label: "Promoções" },
          ]}
        />

        <div className="space-y-3 text-small text-secondary-foreground/70">
          <p className="text-small font-semibold text-secondary-foreground">Contato</p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" /> {ADDRESS_LINE}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 shrink-0" />
            <a href={TEL_URL} className="hover:text-secondary-foreground">
              {BUSINESS.phoneDisplay}
            </a>
          </p>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0" />
            <StoreHoursList />
          </div>
          <div className="overflow-hidden rounded-md border border-white/10">
            <iframe
              title="Mapa da Kero Mais em Pedreira"
              src={MAPS_EMBED_URL}
              loading="lazy"
              className="h-36 w-full"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-secondary-foreground hover:underline"
          >
            <Navigation className="size-4 shrink-0" /> Como chegar
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-4 text-caption text-secondary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kero Mais. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link to="/sobre" className="hover:text-secondary-foreground">
              Termos de uso
            </Link>
            <Link to="/sobre" className="hover:text-secondary-foreground">
              Política de privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-small font-semibold">{title}</p>
      <ul className="space-y-2 text-small text-secondary-foreground/70">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="hover:text-secondary-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
