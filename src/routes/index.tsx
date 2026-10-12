import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { menuQueryOptions } from "@/features/menu/useMenu";
import { BUSINESS, GOOGLE_PROFILE } from "@/lib/business";
import { openingHoursProps, storeHoursQueryOptions } from "@/features/store/hours";
import { Highlights } from "@/components/home/Highlights";
import { Differentials } from "@/components/home/Differentials";
import { WeeklyPromo } from "@/components/home/WeeklyPromo";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCta } from "@/components/home/FinalCta";

const TITLE = "Kero Mais | Hambúrgueres, Hot Dogs e Delivery em Pedreira";
const DESCRIPTION =
  "Peça hambúrgueres, hot dogs, combos e bebidas na Kero Mais. Delivery rápido em Pedreira com atendimento ágil e produtos preparados na hora.";
const URL = "https://kero-mais-delight.lovable.app/";

export const Route = createFileRoute("/")({
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Kero Mais",
          description: DESCRIPTION,
          url: URL,
          servesCuisine: ["Hambúrgueres", "Hot Dogs", "Fast Food"],
          priceRange: "$$",
          telephone: BUSINESS.phoneSchema,
          address: {
            "@type": "PostalAddress",
            streetAddress: `${BUSINESS.address.street} — ${BUSINESS.address.district}`,
            addressLocality: BUSINESS.address.city,
            addressRegion: BUSINESS.address.state,
            addressCountry: BUSINESS.address.country,
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: BUSINESS.geo.latitude,
            longitude: BUSINESS.geo.longitude,
          },
          ...openingHoursProps(loaderData?.hours),
          ...(GOOGLE_PROFILE.placeUrl ? { hasMap: GOOGLE_PROFILE.placeUrl } : {}),
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "3000",
          },
          hasMenu: "https://kero-mais-delight.lovable.app/cardapio",
        }),
      },
    ],
  }),
  // Pré-carrega o cardápio para a seção de categorias já aparecer preenchida.
  loader: async ({ context }) => {
    void context.queryClient.ensureQueryData(menuQueryOptions).catch(() => undefined);
    // Horários reais (tabela store_hours) para os dados estruturados do Google.
    const hours = await context.queryClient.ensureQueryData(storeHoursQueryOptions).catch(() => []);
    return { hours };
  },
  component: Home,
});

function Home() {
  return (
    <PublicShell transparentNav>
      <Hero />
      <Categories />
      <Highlights />
      <Differentials />
      <WeeklyPromo />
      <HowItWorks />
      <Testimonials />
      <FinalCta />
    </PublicShell>
  );
}
