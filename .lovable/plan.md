
# Plataforma Kero Mais — Fundação Arquitetural

Esta etapa entrega a **base estrutural** da plataforma (arquitetura, pastas, módulos, design system, modelagem de dados e fluxos). Nenhuma funcionalidade de negócio será implementada agora — apenas o esqueleto pronto para evoluir.

> Observação técnica: o projeto já roda em **TanStack Start + React + TypeScript + Tailwind v4 + shadcn/ui**, que é equivalente funcional ao Next.js pedido (SSR, file-based routing, server functions). Vou seguir com essa stack em vez de Next.js. Backend via **Lovable Cloud** (Supabase gerenciado).

---

## 1. Módulos da plataforma

```text
┌─────────────────────────────────────────────────────────┐
│                    KERO MAIS PLATFORM                   │
├──────────────┬───────────────┬──────────────┬───────────┤
│  Público     │  Cliente      │  Admin       │  Cozinha  │
│  (/)         │  (/conta)     │  (/admin)    │  (/kds)   │
├──────────────┼───────────────┼──────────────┼───────────┤
│ Home         │ Login/Cadastro│ Dashboard    │ Fila      │
│ Cardápio     │ Meus pedidos  │ Pedidos      │ Preparo   │
│ Promoções    │ Endereços     │ Produtos     │ Pronto    │
│ Sobre        │ Perfil        │ Categorias   │ Impressão │
│ Contato      │ Favoritos     │ Promoções    │           │
│ Checkout     │               │ Cupons       │           │
│              │               │ Clientes     │           │
│              │               │ Funcionários │           │
│              │               │ Config       │           │
│              │               │ Relatórios   │           │
└──────────────┴───────────────┴──────────────┴───────────┘
```

Cada módulo tem seu próprio grupo de rotas, layout e guards de acesso (público, `_authenticated`, `_admin`, `_kitchen`).

---

## 2. Estrutura de pastas

```text
src/
├── routes/                    # File-based routing (TanStack)
│   ├── __root.tsx
│   ├── index.tsx              # Home
│   ├── cardapio.tsx
│   ├── cardapio.$categoria.tsx
│   ├── produto.$slug.tsx
│   ├── promocoes.tsx
│   ├── sobre.tsx
│   ├── contato.tsx
│   ├── checkout.tsx
│   ├── auth.tsx
│   ├── _authenticated/        # Cliente logado
│   │   ├── route.tsx
│   │   ├── conta.index.tsx
│   │   ├── conta.pedidos.tsx
│   │   ├── conta.pedidos.$id.tsx
│   │   └── conta.enderecos.tsx
│   ├── _admin/                # Painel admin (role: admin)
│   │   ├── route.tsx
│   │   ├── admin.index.tsx    # dashboard
│   │   ├── admin.pedidos.tsx
│   │   ├── admin.produtos.tsx
│   │   ├── admin.categorias.tsx
│   │   ├── admin.promocoes.tsx
│   │   ├── admin.cupons.tsx
│   │   ├── admin.clientes.tsx
│   │   ├── admin.funcionarios.tsx
│   │   ├── admin.relatorios.tsx
│   │   └── admin.config.tsx
│   ├── _kitchen/              # KDS (role: kitchen/admin)
│   │   ├── route.tsx
│   │   └── kds.index.tsx
│   └── api/
│       └── public/            # webhooks (pagamento, impressão)
│
├── features/                  # Lógica por domínio
│   ├── menu/                  # produtos, categorias, busca
│   ├── cart/                  # carrinho (Zustand + persist)
│   ├── checkout/              # fluxo checkout
│   ├── orders/                # pedidos e status
│   ├── auth/                  # login/cadastro
│   ├── customer/              # perfil, endereços
│   ├── admin/                 # CRUDs admin
│   ├── kitchen/               # KDS
│   ├── promotions/            # promoções e cupons
│   └── delivery/              # zonas e cálculo de frete
│
├── components/
│   ├── ui/                    # shadcn base
│   ├── brand/                 # Logo, BrandMark
│   ├── layout/                # Navbar, Footer, AdminShell, KDSShell
│   ├── product/               # ProductCard, ProductGrid, QuantitySelector
│   ├── cart/                  # CartDrawer, CartItem, CartSummary
│   ├── order/                 # OrderTimeline, OrderStatusBadge
│   ├── promo/                 # PromotionBanner, CouponInput
│   ├── forms/                 # CheckoutForm, AddressForm
│   └── shared/                # SectionTitle, EmptyState, Loading, Modal
│
├── hooks/                     # useCart, useAuth, useOrder, useMediaQuery...
├── lib/                       # supabase, utils, formatters, validators (zod)
├── services/                  # camada de acesso (server fns / queries)
├── types/                     # tipos de domínio + Database types
├── styles/                    # styles.css + tokens
└── integrations/supabase/     # cliente gerado
```

---

## 3. Design System (Kero Mais)

Tokens em `src/styles.css` (oklch), aplicados via shadcn variants — nunca hardcoded.

**Paleta**
- `--primary` Vermelho Kero (~ oklch(0.58 0.22 25))
- `--background` Branco / `--foreground` Preto profundo
- `--accent` Amarelo destaque (oklch(0.85 0.17 90))
- `--muted`, `--card`, `--border` em tons neutros quentes
- Dark mode planejado, não priorizado

**Tipografia**: display sans forte para títulos + sans neutra para corpo (definir na etapa visual).

**Componentes-base** a criar como wrappers/variants shadcn: Button (hero, cta, ghost), Card, Badge (promo, status), ProductCard, CategoryCard, PromotionBanner, QuantitySelector, CartDrawer, OrderTimeline, SectionTitle, EmptyState, Toast, Loading, Modal.

---

## 4. Modelagem inicial do banco (Supabase)

```text
auth.users (Supabase)
  └─ user_roles (user_id, role: admin|kitchen|customer)  ← segurança
  └─ customers (perfil estendido)
        └─ addresses
        └─ orders ──┬─ order_items ── order_item_options
                    ├─ payments
                    └─ order_status_history
categories ─< products >─ product_variants
                       >─ product_option_groups ─< product_options
promotions, coupons, coupon_redemptions
delivery_zones, payment_methods
settings (kv), notifications, employees
```

Regras:
- **Roles em tabela separada** (`user_roles`) + função `has_role()` security definer.
- **RLS** ativado em todas as tabelas. Cliente lê o próprio; admin/kitchen via `has_role`.
- Leitura pública (cardápio, promoções ativas) via policies `TO anon` estritas.
- Grants explícitos (`authenticated`, `anon` quando aplicável, `service_role`).

---

## 5. Fluxo de navegação

```text
Home ──► Cardápio ──► Produto (modal/página)
                          │
                          ▼
                   Adicionar ao carrinho ──► CartDrawer
                                                │
                                                ▼
                                            Checkout
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                        Entrega/Retirada   Pagamento          Login/Guest
                              └─────────────────┼─────────────────┘
                                                ▼
                                         Pedido criado
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                             Cliente: status  KDS: fila  Admin: pedidos
```

Meta UX: pedido em **< 60s**, checkout em página única com steps colapsáveis, guest checkout permitido.

---

## 6. Stack e camadas

- **Roteamento/SSR**: TanStack Start (equivalente Next.js nesta plataforma)
- **UI**: Tailwind v4 + shadcn/ui + Framer Motion + Lucide
- **Forms**: React Hook Form + Zod
- **Data**: TanStack Query + server functions (`createServerFn`)
- **Estado carrinho**: Zustand com persist (localStorage)
- **Backend**: Lovable Cloud (Supabase) — Auth, DB, Storage, Realtime (KDS)
- **Pagamentos**: preparado para Stripe (a habilitar depois)
- **SEO**: `head()` por rota, sitemap.xml, robots.txt, JSON-LD Restaurant/Menu

---

## 7. Entregáveis desta etapa (somente scaffold)

1. Tokens de marca em `src/styles.css` (vermelho/preto/branco/amarelo).
2. Estrutura de pastas `features/`, `components/{ui,brand,layout,product,cart,order,promo,forms,shared}/`, `hooks/`, `services/`, `types/`, `lib/`.
3. Placeholders de rotas públicas, `_authenticated/`, `_admin/`, `_kitchen/` (cada rota renderiza um `EmptyState` "Em construção" com layout correto e `head()` SEO próprio).
4. `Navbar`, `Footer`, `AdminShell`, `KDSShell` iniciais com identidade Kero Mais.
5. Home substituindo o placeholder — hero da marca + seções vazias sinalizadas.
6. `types/domain.ts` com interfaces (Product, Category, Order, etc.) — sem lógica.
7. `sitemap.xml` + `robots.txt`.
8. README de arquitetura em `src/routes/README.md` atualizado.

**Fora do escopo desta etapa**: CRUDs, autenticação real, checkout funcional, integração de pagamento, migrations do banco (a modelagem fica documentada; as migrations vêm quando começarmos a implementar cada módulo).

---

Confirma que sigo com este scaffold? Posso já ativar o **Lovable Cloud** na próxima etapa para começarmos autenticação + tabelas.
