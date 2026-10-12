import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import dsBurger from "@/assets/ds-burger.jpg";
import dsCombo from "@/assets/ds-combo.jpg";
import prodChicken from "@/assets/prod-chicken.jpg";
import prodHotdog from "@/assets/prod-hotdog.jpg";

const HIGHLIGHTS = [
  {
    id: "kero-classic",
    name: "Kero Classic",
    description: "Blend 180g, cheddar, alface, tomate e molho da casa no pão brioche.",
    price: 29.9,
    compareAt: 34.9,
    image: dsBurger,
    rating: 4.9,
    ratingCount: 214,
    promoLabel: "Mais pedido",
  },
  {
    id: "combo-kero",
    name: "Combo Kero Mais",
    description: "Hambúrguer artesanal + batata crocante + bebida gelada 350ml.",
    price: 44.9,
    compareAt: 52.9,
    image: dsCombo,
    rating: 4.8,
    ratingCount: 168,
    promoLabel: "-15%",
  },
  {
    id: "crispy-chicken",
    name: "Crispy Chicken",
    description: "Frango empanado crocante, alface fresca e molho especial levemente picante.",
    price: 27.9,
    image: prodChicken,
    rating: 4.7,
    ratingCount: 96,
    isNew: true,
  },
  {
    id: "dog-cheddar",
    name: "Dog Cheddar Bacon",
    description: "Salsicha artesanal, cheddar cremoso, bacon e cebola crispy.",
    price: 22.9,
    image: prodHotdog,
    rating: 4.8,
    ratingCount: 132,
  },
];

/** Kero Mais — Destaques da casa */
export function Highlights() {
  const [favorites, setFavorites] = React.useState<string[]>([]);

  const toggleFavorite = (id: string, name: string) => {
    setFavorites((prev) => {
      const has = prev.includes(id);
      toast[has ? "info" : "success"](
        has ? `${name} removido dos favoritos` : `${name} salvo nos favoritos`,
      );
      return has ? prev.filter((f) => f !== id) : [...prev, id];
    });
  };

  return (
    <section className="bg-muted/60 py-16 md:py-24">
      <div className="container-page">
        <Reveal>
          <SectionTitle
            eyebrow="Mais pedidos"
            title="Destaques da casa"
            description="Os campeões de pedido da semana, direto da chapa para você."
            action={
              <Button asChild variant="ghost" className="gap-1">
                <Link to="/cardapio">
                  Ver cardápio completo <ArrowRight />
                </Link>
              </Button>
            }
          />
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06} className="h-full">
              <ProductCard
                className="h-full"
                name={p.name}
                description={p.description}
                price={p.price}
                compareAt={p.compareAt}
                image={p.image}
                rating={p.rating}
                ratingCount={p.ratingCount}
                isNew={p.isNew}
                promoLabel={p.promoLabel}
                favorite={favorites.includes(p.id)}
                onToggleFavorite={() => toggleFavorite(p.id, p.name)}
                onAdd={() => toast.success(`${p.name} adicionado ao carrinho`)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
