import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, User } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/features/cart/CartProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/promocoes", label: "Promoções" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

/** Kero Mais — Navbar sticky, transparente sobre o hero e sólida ao rolar. */
export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const cart = useCart();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "border-b border-border bg-background/90 shadow-soft backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-18">
        <Link to="/" aria-label="Kero Mais — início" className="flex items-center">
          <Logo variant={solid ? "default" : "light"} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-md px-3 py-2 text-small font-semibold transition-colors",
                solid
                  ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                  : "text-secondary-foreground/80 hover:text-secondary-foreground",
              )}
              activeProps={{
                className: solid ? "text-primary" : "text-secondary-foreground",
              }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Minha conta"
            className={cn("hidden sm:inline-flex", !solid && "text-secondary-foreground hover:bg-white/10")}
          >
            <Link to="/auth">
              <User />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Carrinho${cart.count > 0 ? ` com ${cart.count} itens` : " vazio"}`}
            onClick={cart.openCart}
            className={cn("relative", !solid && "text-secondary-foreground hover:bg-white/10")}
          >
            <ShoppingBag />
            {cart.count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-caption font-bold text-primary-foreground">
                {cart.count}
              </span>
            ) : null}
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link to="/cardapio">Fazer Pedido</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                className={cn("lg:hidden", !solid && "text-secondary-foreground hover:bg-white/10")}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm p-0">
              <div className="flex h-full flex-col">
                <div className="border-b p-5">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-3 font-display text-h5 font-bold text-foreground transition-colors hover:bg-accent"
                      activeProps={{ className: "text-primary" }}
                      activeOptions={{ exact: item.to === "/" }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto space-y-3 border-t p-5">
                  <Button asChild full size="lg" onClick={() => setOpen(false)}>
                    <Link to="/cardapio">🍔 Fazer Pedido</Link>
                  </Button>
                  <Button asChild full variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/auth">Entrar / Cadastrar</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
