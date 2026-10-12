import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Reveal } from "@/components/shared/Reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { menuQueryOptions } from "@/features/menu/useMenu";
import type { MenuCategory } from "@/features/menu/types";
import catBurgers from "@/assets/cat-burgers.jpg";
import catHotdogs from "@/assets/cat-hotdogs.jpg";
import catCombos from "@/assets/cat-combos.jpg";
import catDrinks from "@/assets/cat-drinks.jpg";
import catPromos from "@/assets/cat-promos.jpg";
import menuBanner from "@/assets/menu-banner.jpg";

const CARD_CLASS =
  "group relative flex h-56 flex-col justify-end overflow-hidden rounded-card border border-border shadow-card transition-shadow hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-64";

const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Emoji e imagem padrão de uma categoria, escolhidos pelo nome/slug.
 * Serve para categorias novas criadas no admin que ainda não têm imagem própria.
 * Se a categoria tiver imagem cadastrada no admin, ela tem prioridade.
 */
function visualFor(cat: MenuCategory): { emoji: string; image: string } {
  const key = normalize(`${cat.id} ${cat.name}`);
  if (/hot ?-?dog|cachorro/.test(key)) return { emoji: "🌭", image: catHotdogs };
  if (/combo/.test(key)) return { emoji: "🍟", image: catCombos };
  if (/bebida|drink|suco|refri/.test(key)) return { emoji: "🥤", image: catDrinks };
  if (/sobremesa|dessert|doce/.test(key)) return { emoji: "🍰", image: catPromos };
  if (/frances|\bpao\b/.test(key)) return { emoji: "🥖", image: catBurgers };
  if (/frango|chicken/.test(key)) return { emoji: "🍗", image: catBurgers };
  if (/burger|hamburg|lanche/.test(key)) return { emoji: "🍔", image: catBurgers };
  return { emoji: "🍽️", image: menuBanner };
}

interface CardData {
  key: string;
  emoji: string;
  label: string;
  description: string;
  image: string;
  /** slug da categoria; ausente = card de Promoções */
  categoryId?: string;
}

function CategoryCardLink({ card }: { card: CardData }) {
  const content = (
    <>
      <img
        src={card.image}
        alt={card.label}
        loading="lazy"
        width={768}
        height={768}
        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-linear-to-t from-secondary via-secondary/60 to-secondary/5" />
      <span className="relative space-y-1 p-6 text-secondary-foreground">
        <span className="block text-h4">{card.emoji}</span>
        <span className="block font-display text-h4 font-extrabold leading-tight">{card.label}</span>
        <span className="block text-small text-secondary-foreground/75">{card.description}</span>
      </span>
    </>
  );

  // O cardápio lê o filtro pelo parâmetro `cat` (slug da categoria no banco).
  if (card.categoryId) {
    return (
      <Link to="/cardapio" search={{ cat: card.categoryId }} className={CARD_CLASS}>
        {content}
      </Link>
    );
  }
  return (
    <Link to="/promocoes" className={CARD_CLASS}>
      {content}
    </Link>
  );
}

/** Kero Mais — Seção de categorias da Home (lê as categorias cadastradas no admin) */
export function Categories() {
  const { data, isPending, isError } = useQuery(menuQueryOptions);

  const cards: CardData[] = [];
  if (data) {
    const withProducts = new Set(data.products.map((p) => p.categoryId));
    for (const cat of data.categories.slice().sort((a, b) => a.position - b.position)) {
      // Categoria sem nenhum produto ativo não aparece (evita card que leva a uma seção vazia).
      if (!withProducts.has(cat.id)) continue;
      const visual = visualFor(cat);
      cards.push({
        key: cat.id,
        emoji: visual.emoji,
        label: cat.name,
        description: cat.description || "Veja as opções e monte seu pedido.",
        image: cat.image || visual.image,
        categoryId: cat.id,
      });
    }
  }
  cards.push({
    key: "__promocoes__",
    emoji: "🎁",
    label: "Promoções",
    description: "Ofertas da semana com preço especial.",
    image: catPromos,
  });

  // Na grade de 3 colunas, o 1º card só ocupa 2 colunas quando isso fecha a última linha.
  const featuredFirst = (cards.length + 1) % 3 === 0;

  return (
    <section className="container-page py-16 md:py-24">
      <Reveal>
        <SectionTitle
          eyebrow="Cardápio"
          title="Escolha seu favorito"
          description="Navegue pelas categorias e monte seu pedido em poucos toques."
        />
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isPending ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-card md:h-64" />
          ))
        ) : (
          cards.map((card, i) => (
            <Reveal
              key={card.key}
              delay={i * 0.06}
              className={featuredFirst && i === 0 ? "lg:col-span-2 lg:row-span-1" : undefined}
            >
              <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                <CategoryCardLink card={card} />
              </motion.div>
            </Reveal>
          ))
        )}
      </div>

      {isError ? (
        <p className="mt-6 text-center text-small text-muted-foreground">
          Não foi possível carregar as categorias agora.{" "}
          <Link to="/cardapio" className="font-semibold text-primary underline-offset-4 hover:underline">
            Ver o cardápio completo
          </Link>
        </p>
      ) : null}
    </section>
  );
}
