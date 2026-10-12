import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/ui/price-tag";
import { Reveal } from "@/components/shared/Reveal";
import promoWeek from "@/assets/promo-week.jpg";

/** Kero Mais — Promoção da semana (banner premium) */
export function WeeklyPromo() {
  return (
    <section className="container-page py-16 md:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-card bg-secondary text-secondary-foreground shadow-float">
          <img
            src={promoWeek}
            alt="Combo Duplo Kero: dois hambúrgueres, batata e duas bebidas"
            loading="lazy"
            width={1536}
            height={1024}
            className="absolute inset-0 size-full object-cover"
          />
          <span className="absolute inset-0 bg-linear-to-r from-secondary via-secondary/90 to-secondary/25" />

          <div className="relative grid gap-6 p-8 md:min-h-[26rem] md:content-center md:p-14 lg:max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="promo">Promoção da semana</Badge>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-caption font-semibold text-secondary-foreground/85">
                <Clock className="size-3.5" /> Válida até domingo
              </span>
            </div>

            <h2 className="font-display text-h3 font-black leading-tight md:text-h1">
              Combo Duplo Kero: 2 lanches, batata e 2 bebidas
            </h2>
            <p className="max-w-lg text-body text-secondary-foreground/75">
              O pedido perfeito para dividir — ou não. Quantidade limitada por dia.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <PriceTag
                price={69.9}
                compareAt={94.8}
                size="lg"
                className="[&_span:first-child]:text-secondary-foreground [&_span:last-child]:text-secondary-foreground/60"
              />
              <Button asChild size="xl" className="gap-2">
                <Link to="/promocoes">
                  Aproveitar Oferta <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
