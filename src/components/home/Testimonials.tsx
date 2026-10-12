import { Quote } from "lucide-react";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Reveal } from "@/components/shared/Reveal";
import { RatingStars } from "@/components/ui/price-tag";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TESTIMONIALS = [
  {
    name: "Mariana Alves",
    initials: "MA",
    rating: 5,
    comment:
      "Melhor hambúrguer de Pedreira, sem exagero. Chegou quentinho em 25 minutos e o atendimento foi impecável.",
  },
  {
    name: "Rafael Souza",
    initials: "RS",
    rating: 5,
    comment:
      "Peço todo fim de semana. O combo vale muito a pena e dá para finalizar o pedido em menos de um minuto.",
  },
  {
    name: "Carla Dias",
    initials: "CD",
    rating: 5,
    comment: "Ingredientes muito frescos e o cheddar do dog é surreal. Virou o favorito lá de casa.",
  },
  {
    name: "Tiago Moreira",
    initials: "TM",
    rating: 4,
    comment: "Aplicativo simples, entrega rápida e sempre certinho. Recomendo o Crispy Chicken.",
  },
];

/** Kero Mais — Depoimentos */
export function Testimonials() {
  return (
    <section className="container-page py-16 md:py-24">
      <Reveal>
        <SectionTitle
          align="center"
          eyebrow="Quem pede, volta"
          title="O que dizem nossos clientes"
          description="Mais de 3.000 pedidos entregues com nota média 4,9."
        />
      </Reveal>

      <Reveal delay={0.1}>
        <Carousel opts={{ align: "start", loop: true }} className="mt-10 sm:px-12">
          <CarouselContent className="-ml-4">
            {TESTIMONIALS.map((t) => (
              <CarouselItem key={t.name} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                <figure className="flex h-full flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-hover">
                  <Quote className="size-7 text-primary/30" />
                  <blockquote className="flex-1 text-body text-muted-foreground">
                    “{t.comment}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 border-t pt-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 font-display font-bold text-primary">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-display font-bold">{t.name}</p>
                      <RatingStars value={t.rating} />
                    </div>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </Reveal>
    </section>
  );
}
