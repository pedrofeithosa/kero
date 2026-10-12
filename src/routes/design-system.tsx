import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bike,
  CreditCard,
  Flame,
  Home,
  IceCream,
  Info,
  MapPin,
  Sandwich,
  Store,
  Coffee,
} from "lucide-react";

import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EmptyState } from "@/components/shared/EmptyState";
import { Reveal } from "@/components/shared/Reveal";
import { SelectableCard } from "@/components/shared/SelectableCard";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { CategoryCard } from "@/components/product/CategoryCard";
import { PromotionBanner, CouponCard } from "@/components/promo/PromotionBanner";
import { OrderStatusBadge, OrderTimeline } from "@/components/order/OrderStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput, PasswordInput } from "@/components/ui/field-inputs";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { PriceTag, RatingStars } from "@/components/ui/price-tag";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicShell } from "@/components/layout/PublicShell";

import burger from "@/assets/ds-burger.jpg";
import combo from "@/assets/ds-combo.jpg";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Design System Kero Mais — Guia visual oficial" },
      {
        name: "description",
        content:
          "Tokens, tipografia, grid, componentes e regras de consistência do Design System oficial da lanchonete Kero Mais.",
      },
      { property: "og:title", content: "Design System Kero Mais" },
      {
        property: "og:description",
        content: "Guia visual e biblioteca de componentes da plataforma Kero Mais.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DesignSystemPage,
});

/* ------------------------------------------------------------------ */

function Block({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6 border-t border-border py-12">
      <SectionTitle title={title} description={description} />
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-card border border-border bg-card p-5 shadow-soft">
      <p className="text-caption font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const PALETTE = [
  { name: "Primária — Vermelho", hex: "#D62828", token: "primary", cls: "bg-primary" },
  { name: "Secundária — Preto", hex: "#111111", token: "secondary", cls: "bg-secondary" },
  { name: "Branco", hex: "#FFFFFF", token: "background", cls: "bg-background border" },
  { name: "Cinza Claro", hex: "#F7F7F7", token: "muted", cls: "bg-muted border" },
  { name: "Cinza Médio", hex: "#D9D9D9", token: "border", cls: "bg-border" },
  { name: "Cinza Escuro", hex: "#444444", token: "muted-foreground", cls: "bg-muted-foreground" },
  { name: "Amarelo", hex: "#F4B400", token: "highlight", cls: "bg-highlight" },
  { name: "Verde — sucesso", hex: "#16A34A", token: "success", cls: "bg-success" },
  { name: "Azul — informação", hex: "#2563EB", token: "info", cls: "bg-info" },
  { name: "Vermelho — erro", hex: "#DC2626", token: "destructive", cls: "bg-destructive" },
];

const TYPE_SCALE = [
  { name: "Hero", size: "56px", cls: "text-hero", font: "Poppins 800" },
  { name: "H1", size: "48px", cls: "text-h1", font: "Poppins 800" },
  { name: "H2", size: "40px", cls: "text-h2", font: "Poppins 800" },
  { name: "H3", size: "32px", cls: "text-h3", font: "Poppins 700" },
  { name: "H4", size: "24px", cls: "text-h4", font: "Poppins 700" },
  { name: "H5", size: "20px", cls: "text-h5", font: "Poppins 700" },
  { name: "Texto", size: "16px", cls: "text-body", font: "Inter 400/500" },
  { name: "Texto pequeno", size: "14px", cls: "text-small", font: "Inter 400/500" },
  { name: "Legenda", size: "12px", cls: "text-caption", font: "Inter 500/600" },
];

const NAV_LINKS = [
  ["tokens", "Tokens"],
  ["cores", "Cores"],
  ["tipografia", "Tipografia"],
  ["espacamento", "Espaçamento & Grid"],
  ["bordas", "Bordas & Sombras"],
  ["botoes", "Botões"],
  ["inputs", "Inputs"],
  ["componentes", "Componentes"],
  ["produto", "Product Card"],
  ["pedido", "Pedido & Checkout"],
  ["icones", "Ícones & Animações"],
  ["regras", "Regras de consistência"],
] as const;

function DesignSystemPage() {
  const [qty, setQty] = React.useState(2);
  const [search, setSearch] = React.useState("");
  const [chip, setChip] = React.useState("burgers");
  const [fav, setFav] = React.useState(false);
  const [pay, setPay] = React.useState("pix");

  return (
    <PublicShell>
      {/* Hero */}
      <header className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgb(214_40_40/0.45),transparent_60%)]" />
        <Container className="relative py-16 md:py-24">
          <Badge variant="promo">Design System v1</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-h1 font-black leading-[1.05] md:text-hero">
            A linguagem visual oficial da <span className="text-primary">Kero Mais</span>
          </h1>
          <p className="mt-4 max-w-2xl text-body text-secondary-foreground/75">
            Tokens, tipografia, grid, componentes e regras que todas as telas da plataforma —
            site, cardápio, checkout, área do cliente, admin e cozinha — devem seguir.
          </p>
          <nav aria-label="Seções do design system" className="mt-8 flex flex-wrap gap-2">
            {NAV_LINKS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full border border-white/20 px-4 py-2 text-small font-semibold text-secondary-foreground/85 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </header>

      <Container className="pb-24">
        {/* TOKENS */}
        <Block
          id="tokens"
          title="Tokens de design"
          description="Todos os valores vivem em src/styles.css como CSS variables. Componentes nunca usam cores ou tamanhos hardcoded."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { t: "Cor", d: "--primary, --secondary, --highlight, --success, --info, --destructive…" },
              { t: "Tipografia", d: "--font-display (Poppins), --font-sans (Inter) e escala --text-hero → --text-caption" },
              { t: "Raio", d: "--radius-card 20 · --radius-button 16 · --radius-input 14 · --radius-modal 24" },
              { t: "Sombra", d: "--shadow-soft, --shadow-card, --shadow-hover, --shadow-brand, --shadow-float" },
              { t: "Layout", d: "--container-page 1280px e gutters 16 / 24 / 32" },
              { t: "Movimento", d: "--ease-brand cubic-bezier(.22,1,.36,1) — animações discretas" },
            ].map((i) => (
              <div key={i.t} className="rounded-card border border-border bg-card p-5 shadow-soft">
                <p className="font-display text-h5 font-bold">{i.t}</p>
                <p className="mt-1 text-small text-muted-foreground">{i.d}</p>
              </div>
            ))}
          </div>
        </Block>

        {/* CORES */}
        <Block
          id="cores"
          title="Paleta oficial"
          description="Vermelho para ação e desejo, preto para estrutura, neutros para respiro, destaques só para significado (promoção, sucesso, informação, erro)."
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {PALETTE.map((c) => (
              <div key={c.hex} className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
                <div className={`h-20 w-full ${c.cls}`} />
                <div className="space-y-0.5 p-3">
                  <p className="text-small font-semibold">{c.name}</p>
                  <p className="text-caption font-mono uppercase text-muted-foreground">{c.hex}</p>
                  <p className="text-caption text-muted-foreground">--{c.token}</p>
                </div>
              </div>
            ))}
          </div>
        </Block>

        {/* TIPOGRAFIA */}
        <Block
          id="tipografia"
          title="Tipografia"
          description="Poppins (700/800) nos títulos, Inter (400/500/600) no conteúdo. A escala reduz proporcionalmente no mobile."
        >
          <div className="space-y-4 rounded-card border border-border bg-card p-6 shadow-soft">
            {TYPE_SCALE.map((t) => (
              <div
                key={t.name}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <p className={`${t.cls} min-w-0 truncate font-display font-extrabold`}>
                  Kero Mais — {t.name}
                </p>
                <p className="shrink-0 text-caption text-muted-foreground">
                  {t.size} · {t.font} · .{t.cls}
                </p>
              </div>
            ))}
          </div>
        </Block>

        {/* ESPAÇAMENTO */}
        <Block
          id="espacamento"
          title="Espaçamento & Grid"
          description="Escala baseada em múltiplos de 8. Container 1280px com gutters de 16px (mobile), 24px (tablet) e 32px (desktop). Grid de 12 colunas."
        >
          <div className="flex flex-wrap items-end gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
            {[8, 16, 24, 32, 40, 48, 64, 80].map((s) => (
              <div key={s} className="text-center">
                <div className="rounded-sm bg-primary" style={{ width: s, height: s }} />
                <p className="mt-2 text-caption text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
          <div className="grid-12 rounded-card border border-dashed border-primary/40 bg-primary/5 p-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="grid h-16 place-items-center rounded-sm bg-primary/15 text-caption font-bold text-primary"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="text-small text-muted-foreground">
            Breakpoints suportados: 320 · 375 · 768 · 1024 · 1440. Mobile first, sempre.
          </p>
        </Block>

        {/* BORDAS E SOMBRAS */}
        <Block id="bordas" title="Bordas & Sombras" description="Cantos generosos e sombras leves — nada pesado.">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Cards", "rounded-card", "20px"],
              ["Botões", "rounded-button", "16px"],
              ["Inputs", "rounded-input", "14px"],
              ["Modais", "rounded-modal", "24px"],
            ].map(([label, cls, val]) => (
              <div key={label} className={`grid h-28 place-items-center border-2 border-primary/30 bg-card ${cls}`}>
                <div className="text-center">
                  <p className="font-display font-bold">{label}</p>
                  <p className="text-caption text-muted-foreground">{val} · .{cls}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {["shadow-soft", "shadow-card", "shadow-hover", "shadow-float"].map((s) => (
              <div key={s} className={`grid h-24 place-items-center rounded-card bg-card ${s}`}>
                <p className="text-small font-semibold">.{s}</p>
              </div>
            ))}
          </div>
        </Block>

        {/* BOTÕES */}
        <Block
          id="botoes"
          title="Botões"
          description="Sete padrões, todos com default, hover, active, focus visível, disabled e loading."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Row label="Variantes">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="whatsapp">WhatsApp</Button>
            </Row>
            <Row label="Tamanhos">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">XL</Button>
              <Button size="icon" aria-label="Adicionar item">
                <Flame />
              </Button>
            </Row>
            <Row label="Estados">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Carregando</Button>
              <Button variant="outline" loading>
                Salvando
              </Button>
            </Row>
            <Row label="Uso">
              <Button full className="gap-2">
                <Flame /> Adicionar ao carrinho
              </Button>
            </Row>
          </div>
          <p className="text-small text-muted-foreground">
            O botão flutuante do WhatsApp fica fixo no canto inferior direito em todas as páginas
            públicas (veja no canto da tela).
          </p>
        </Block>

        {/* INPUTS */}
        <Block
          id="inputs"
          title="Inputs"
          description="Campos de 48px de altura, raio 14px, foco visível e mensagens de estado explícitas."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-card border border-border bg-card p-6 shadow-soft">
              <div className="space-y-2">
                <Label htmlFor="ds-name">Input — normal</Label>
                <Input id="ds-name" placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-err">Input — erro</Label>
                <Input id="ds-err" state="error" defaultValue="email-invalido" aria-invalid />
                <p className="text-caption font-semibold text-destructive">Informe um e-mail válido.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-ok">Input — sucesso</Label>
                <Input id="ds-ok" state="success" defaultValue="cliente@keromais.com" />
                <p className="text-caption font-semibold text-success">E-mail confirmado.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-dis">Input — disabled</Label>
                <Input id="ds-dis" disabled placeholder="Indisponível" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-pass">Password</Label>
                <PasswordInput id="ds-pass" placeholder="Sua senha" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-search">Search</Label>
                <SearchInput
                  id="ds-search"
                  placeholder="Buscar no cardápio"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch("")}
                />
              </div>
            </div>

            <div className="space-y-5 rounded-card border border-border bg-card p-6 shadow-soft">
              <div className="space-y-2">
                <Label htmlFor="ds-obs">Textarea</Label>
                <Textarea id="ds-obs" placeholder="Observações do pedido (sem cebola, ponto da carne…)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-select">Select</Label>
                <Select>
                  <SelectTrigger id="ds-select" className="h-12 rounded-input">
                    <SelectValue placeholder="Forma de entrega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="pickup">Retirada na loja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="ds-check" defaultChecked />
                <Label htmlFor="ds-check">Quero receber promoções</Label>
              </div>
              <RadioGroup defaultValue="pix" className="space-y-2">
                {[
                  ["pix", "Pix"],
                  ["card", "Cartão na entrega"],
                ].map(([v, l]) => (
                  <div key={v} className="flex items-center gap-3">
                    <RadioGroupItem value={v} id={`ds-radio-${v}`} />
                    <Label htmlFor={`ds-radio-${v}`}>{l}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex items-center gap-3">
                <Switch id="ds-switch" defaultChecked />
                <Label htmlFor="ds-switch">Loja aberta</Label>
              </div>
              <div className="space-y-2">
                <Label>Quantity Selector</Label>
                <div className="flex gap-3">
                  <QuantitySelector value={qty} onChange={setQty} />
                  <QuantitySelector value={1} onChange={() => {}} size="sm" disabled />
                </div>
              </div>
            </div>
          </div>
        </Block>

        {/* COMPONENTES */}
        <Block
          id="componentes"
          title="Biblioteca de componentes"
          description="Blocos reutilizáveis compartilhados por site, cardápio, checkout, conta, admin e cozinha."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Row label="Badges">
              <Badge>Padrão</Badge>
              <Badge variant="promo">-30%</Badge>
              <Badge variant="new">Novo</Badge>
              <Badge variant="success">Entregue</Badge>
              <Badge variant="info">Confirmado</Badge>
              <Badge variant="warning">Em preparo</Badge>
              <Badge variant="destructive">Cancelado</Badge>
              <Badge variant="outline">Neutro</Badge>
            </Row>
            <Row label="Chips de filtro">
              {[
                ["burgers", "Burgers"],
                ["combos", "Combos"],
                ["bebidas", "Bebidas"],
                ["sobremesas", "Sobremesas"],
              ].map(([v, l]) => (
                <Chip key={v} active={chip === v} onClick={() => setChip(v)}>
                  {l}
                </Chip>
              ))}
            </Row>
            <Row label="Preço e avaliação">
              <PriceTag price={38.9} compareAt={49.9} />
              <RatingStars value={4.7} count={128} />
            </Row>
            <Row label="Avatar, tooltip, dropdown">
              <Avatar>
                <AvatarFallback>KM</AvatarFallback>
              </Avatar>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      Tooltip
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Entrega média de 32 min</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Dropdown
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Meus pedidos</DropdownMenuItem>
                  <DropdownMenuItem>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Row>
            <Row label="Modal, drawer e toast">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Modal
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-modal">
                  <DialogHeader>
                    <DialogTitle>Confirmar pedido</DialogTitle>
                    <DialogDescription>
                      Modais usam raio de 24px e ações alinhadas à direita.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    Drawer
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Seu carrinho</SheetTitle>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success("Item adicionado ao carrinho")}
              >
                Toast
              </Button>
            </Row>
            <Row label="Breadcrumb e paginação">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Início</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Cardápio</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </Row>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card border border-border bg-card p-5 shadow-soft">
              <Tabs defaultValue="entrega">
                <TabsList>
                  <TabsTrigger value="entrega">Entrega</TabsTrigger>
                  <TabsTrigger value="retirada">Retirada</TabsTrigger>
                </TabsList>
                <TabsContent value="entrega" className="pt-4 text-small text-muted-foreground">
                  Taxa calculada por zona de entrega.
                </TabsContent>
                <TabsContent value="retirada" className="pt-4 text-small text-muted-foreground">
                  Retire na loja em até 20 minutos.
                </TabsContent>
              </Tabs>
            </div>
            <div className="rounded-card border border-border bg-card p-5 shadow-soft">
              <Accordion type="single" collapsible>
                <AccordionItem value="a">
                  <AccordionTrigger>Qual o tempo médio de entrega?</AccordionTrigger>
                  <AccordionContent>Entre 30 e 45 minutos, conforme a região.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="b">
                  <AccordionTrigger>Posso pedir sem cadastro?</AccordionTrigger>
                  <AccordionContent>Sim, o checkout aceita pedidos como visitante.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState
              title="Empty State"
              description="Use sempre com ícone, título curto e ação clara."
              action={<Button size="sm">Ver cardápio</Button>}
            />
            <div className="space-y-3 rounded-card border border-border bg-card p-5 shadow-soft">
              <p className="text-caption font-bold uppercase tracking-widest text-muted-foreground">
                Loading Skeleton
              </p>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CategoryCard label="Burgers" count={18} icon={Sandwich} active />
            <CategoryCard label="Combos" count={9} icon={Flame} />
            <CategoryCard label="Bebidas" count={14} icon={Coffee} />
            <CategoryCard label="Sobremesas" count={6} icon={IceCream} />
          </div>

          <PromotionBanner
            eyebrow="Promoção da semana"
            title="Combo duplo por R$ 39,90"
            description="Dois burgers artesanais, fritas e refri. Válido de segunda a quinta."
            image={combo}
            action={<Button size="lg">Aproveitar</Button>}
          />

          <CouponCard
            code="KERO10"
            title="10% OFF no primeiro pedido"
            description="Válido para pedidos acima de R$ 40."
            expiresAt="31/12"
            onCopy={() => toast.success("Cupom copiado!")}
          />
        </Block>

        {/* PRODUCT CARD */}
        <Block
          id="produto"
          title="Product Card"
          description="Componente central do cardápio: imagem grande, nome, descrição curta, preço, adicionar, favoritar, badges e avaliação."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal>
              <ProductCard
                name="Kero Duplo Cheddar"
                description="Dois blends de 120g, cheddar cremoso, cebola caramelizada e pão brioche."
                price={38.9}
                compareAt={49.9}
                image={burger}
                rating={4.8}
                ratingCount={214}
                promoLabel="-22%"
                favorite={fav}
                onToggleFavorite={() => setFav((f) => !f)}
                onAdd={() => toast.success("Kero Duplo Cheddar adicionado")}
              />
            </Reveal>
            <Reveal delay={0.08}>
              <ProductCard
                name="Combo Kero Fritas"
                description="Fritas crocantes com refrigerante gelado de 500ml."
                price={24.5}
                image={combo}
                isNew
                onAdd={() => toast.success("Combo adicionado")}
              />
            </Reveal>
            <Reveal delay={0.16}>
              <ProductCardSkeleton />
            </Reveal>
          </div>
        </Block>

        {/* PEDIDO */}
        <Block
          id="pedido"
          title="Pedido & Checkout"
          description="Status, linha do tempo e cards de seleção usam a mesma gramática visual em cliente, admin e cozinha."
        >
          <Row label="Order Status">
            <OrderStatusBadge status="received" />
            <OrderStatusBadge status="accepted" />
            <OrderStatusBadge status="preparing" />
            <OrderStatusBadge status="ready" />
            <OrderStatusBadge status="out_for_delivery" />
            <OrderStatusBadge status="delivered" />
            <OrderStatusBadge status="cancelled" />
          </Row>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-card border border-border bg-card p-6 shadow-soft">
              <p className="mb-5 font-display text-h5 font-bold">Timeline</p>
              <OrderTimeline
                steps={[
                  { status: "accepted", time: "19:02", done: true },
                  { status: "preparing", time: "19:06", current: true },
                  { status: "out_for_delivery" },
                  { status: "delivered" },
                ]}
              />
            </div>
            <div className="space-y-3">
              <SelectableCard
                icon={Bike}
                title="Entrega"
                description="Chega em 30–45 min"
                meta="Taxa R$ 6,90"
                selected
              />
              <SelectableCard icon={Store} title="Retirada na loja" description="Pronto em 20 min" meta="Grátis" />
              <SelectableCard
                icon={CreditCard}
                title="Cartão de crédito"
                description="Visa •••• 4242"
                selected={pay === "card"}
                onSelect={() => setPay("card")}
              />
              <SelectableCard
                icon={MapPin}
                title="Pix"
                description="Aprovação imediata"
                selected={pay === "pix"}
                onSelect={() => setPay("pix")}
              />
              <SelectableCard
                icon={Home}
                title="Casa"
                description="Rua das Palmeiras, 240 — Centro"
                actions={
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                }
              />
            </div>
          </div>
        </Block>

        {/* ICONES */}
        <Block
          id="icones"
          title="Ícones & Animações"
          description="Lucide React nos tamanhos 16, 20, 24 e 32 — sem misturar estilos. Motion para fade, slide, scale e scroll reveal discretos."
        >
          <Row label="Tamanhos de ícone">
            {[16, 20, 24, 32].map((s) => (
              <span key={s} className="flex flex-col items-center gap-1 text-caption text-muted-foreground">
                <Flame width={s} height={s} className="text-primary" />
                {s}px
              </span>
            ))}
          </Row>
          <Row label="Microinterações">
            <div className="hover-lift grid h-24 w-40 place-items-center rounded-card border border-border bg-card text-small font-semibold">
              hover-lift
            </div>
            <Reveal className="grid h-24 w-40 place-items-center rounded-card border border-border bg-card text-small font-semibold">
              scroll reveal
            </Reveal>
          </Row>
        </Block>

        {/* REGRAS */}
        <Block
          id="regras"
          title="Regras de consistência"
          description="Obrigatórias em todas as telas da plataforma."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Cores", "Sempre via token semântico. Proibido text-white, bg-black ou hex no componente."],
              ["Tipografia", "Títulos em font-display; corpo em Inter. Um único H1 por página."],
              ["Espaçamento", "Múltiplos de 8. Seções públicas com py-12/py-16; painéis com p-6."],
              ["Container", "Todo conteúdo dentro de <Container> (1280px + gutters responsivos)."],
              ["Bordas", "Card 20 · Botão 16 · Input 14 · Modal 24. Não inventar raios."],
              ["Componentes", "Reutilizar a biblioteca. Nada de variação one-off por página."],
              ["Acessibilidade", "Contraste AA, foco visível, alvos de toque ≥ 44px, navegação por teclado."],
              ["Movimento", "Animações ≤ 450ms, easing da marca, sem efeitos exagerados."],
              ["Imagens", "Fotos reais, apetitosas, sempre com bordas arredondadas e alt descritivo."],
              ["Responsivo", "Mobile first, validado em 320 / 375 / 768 / 1024 / 1440."],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3 rounded-card border border-border bg-card p-5 shadow-soft">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-display font-bold">{t}</p>
                  <p className="text-small text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </Block>
      </Container>

      <WhatsAppButton />
    </PublicShell>
  );
}
