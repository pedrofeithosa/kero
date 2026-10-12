import { motion } from "motion/react";
import { CheckCircle2, CreditCard, PackageCheck, ShoppingCart } from "lucide-react";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Reveal } from "@/components/shared/Reveal";

const STEPS = [
  { icon: CheckCircle2, title: "Escolha seus produtos", desc: "Navegue pelo cardápio e monte do seu jeito." },
  { icon: ShoppingCart, title: "Adicione ao carrinho", desc: "Ajuste quantidades e adicionais em um toque." },
  { icon: CreditCard, title: "Finalize o pedido", desc: "Pix, cartão ou dinheiro — em menos de 60 segundos." },
  { icon: PackageCheck, title: "Receba onde estiver", desc: "Acompanhe o preparo e a entrega em tempo real." },
];

/** Kero Mais — Como funciona */
export function HowItWorks() {
  return (
    <section className="bg-secondary py-16 text-secondary-foreground md:py-24">
      <div className="container-page">
        <Reveal>
          <SectionTitle
            align="center"
            eyebrow="Simples assim"
            title="Como funciona"
            description="Quatro passos entre a vontade e a primeira mordida."
            className="[&_h2]:text-secondary-foreground [&_p]:text-secondary-foreground/70"
          />
        </Reveal>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.08} className="h-full">
              <motion.li
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative h-full rounded-card border border-white/10 bg-white/5 p-6"
              >
                <span className="absolute right-5 top-4 font-display text-h2 font-black text-white/10">
                  {i + 1}
                </span>
                <span className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-brand">
                  <Icon className="size-6" />
                </span>
                <p className="font-display text-h5 font-bold">{title}</p>
                <p className="mt-1 text-small text-secondary-foreground/70">{desc}</p>
              </motion.li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
