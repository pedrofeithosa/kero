import menuBanner from "@/assets/menu-banner.jpg";

/** Kero Mais — Banner do cardápio */
export function MenuBanner() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={menuBanner}
        alt="Seleção de hambúrgueres, hot dogs, batatas e bebidas da Kero Mais"
        width={1920}
        height={900}
        className="h-[42vh] min-h-70 w-full object-cover md:h-[46vh]"
      />
      <div className="absolute inset-0 bg-linear-to-r from-secondary/95 via-secondary/80 to-secondary/30" />
      <div className="container-page absolute inset-0 flex flex-col justify-center gap-3">
        <span className="text-caption font-bold uppercase tracking-widest text-highlight">
          Cardápio Kero Mais
        </span>
        <h1 className="max-w-2xl font-display text-h1 font-extrabold leading-tight text-secondary-foreground md:text-hero">
          Nosso Cardápio
        </h1>
        <p className="max-w-xl text-body text-secondary-foreground/85">
          Escolha seus favoritos e monte seu pedido.
        </p>
      </div>
    </section>
  );
}
