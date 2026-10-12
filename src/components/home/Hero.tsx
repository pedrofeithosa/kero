import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Flame, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBurger from "@/assets/home-hero-burger.jpg";

const INDICATORS = [
  { icon: Star, label: "Atendimento rápido" },
  { icon: Flame, label: "Ingredientes selecionados" },
  { icon: Truck, label: "Delivery em Pedreira" },
];

/** Kero Mais — Hero da Home (parallax leve + CTAs de conversão) */
export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 80]);
  const scale = useTransform(scrollY, [0, 600], [1, reduce ? 1 : 1.08]);

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-secondary text-secondary-foreground">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroBurger}
          alt="Hambúrguer artesanal da Kero Mais com queijo derretido"
          width={1536}
          height={1536}
          fetchPriority="high"
          className="size-full object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-r from-secondary/95 via-secondary/70 to-secondary/10" />
      <div className="absolute inset-0 bg-linear-to-t from-secondary/80 via-transparent to-secondary/30" />

      <div className="container-page relative py-28 md:py-32">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-highlight px-3 py-1 text-caption font-bold uppercase tracking-widest text-highlight-foreground">
            <Flame className="size-3.5" /> Feito na hora, todos os dias
          </span>

          <h1 className="font-display text-4xl font-black leading-[1.05] sm:text-5xl md:text-hero">
            O sabor que conquista desde a{" "}
            <span className="text-primary">primeira mordida</span>.
          </h1>

          <p className="max-w-xl text-body text-secondary-foreground/80 md:text-h5">
            Hambúrgueres, hot dogs, combos e bebidas preparados na hora com ingredientes
            selecionados para transformar qualquer momento em uma experiência irresistível.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link to="/cardapio">🍔 Fazer Pedido</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="w-full border-white/25 bg-transparent text-secondary-foreground hover:border-primary hover:bg-white/10 hover:text-secondary-foreground sm:w-auto"
            >
              <Link to="/cardapio">Ver Cardápio</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
            {INDICATORS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-small font-semibold text-secondary-foreground/85"
              >
                <span className="grid size-8 place-items-center rounded-full bg-white/10 text-primary">
                  <Icon className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
