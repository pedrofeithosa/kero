import { motion } from "motion/react";
import { CreditCard, Leaf, Smartphone, Timer, Truck, UtensilsCrossed } from "lucide-react";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Reveal } from "@/components/shared/Reveal";

const ITEMS = [
  { icon: Leaf, title: "Ingredientes selecionados", desc: "Pães frescos, carnes nobres e hortifruti do dia." },
  { icon: UtensilsCrossed, title: "Preparado na hora", desc: "Nada fica pronto esperando: montamos ao receber." },
  { icon: Truck, title: "Entrega rápida", desc: "Delivery ágil em Pedreira, quentinho na sua porta." },
  { icon: Timer, title: "Excelente atendimento", desc: "Time treinado para resolver tudo em minutos." },
  { icon: CreditCard, title: "Pagamento facilitado", desc: "Pix, cartão, dinheiro ou pagamento na entrega." },
  { icon: Smartphone, title: "Pedidos online", desc: "Checkout em menos de 60 segundos pelo celular." },
];

/** Kero Mais — Diferenciais */
export function Differentials() {
  return (
    <section className="container-page py-16 md:py-24">
      <Reveal>
        <SectionTitle
          align="center"
          eyebrow="Por que a Kero Mais"
          title="Qualidade em cada detalhe"
          description="Do preparo à entrega, tudo pensado para você repetir o pedido."
        />
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, desc }, i) => (
          <Reveal key={title} delay={i * 0.05} className="h-full">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group h-full rounded-card border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-hover"
            >
              <span className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Icon className="size-6" />
              </span>
              <p className="font-display text-h5 font-bold">{title}</p>
              <p className="mt-1 text-small text-muted-foreground">{desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
