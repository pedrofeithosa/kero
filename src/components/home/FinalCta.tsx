import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import ctaBg from "@/assets/cta-bg.jpg";

/** Kero Mais — CTA final */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
      <img
        src={ctaBg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1536}
        height={864}
        className="absolute inset-0 size-full scale-105 object-cover blur-sm"
      />
      <span className="absolute inset-0 bg-secondary/80" />
      <div className="container-page relative py-20 text-center md:py-28">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-display text-h3 font-black leading-tight md:text-h1">
            Seu próximo lanche está a poucos cliques.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-secondary-foreground/75">
            Monte seu pedido agora e receba quentinho, do jeito que você gosta.
          </p>
          <Button asChild size="xl" className="mt-8">
            <Link to="/cardapio">🍔 Fazer Pedido Agora</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
