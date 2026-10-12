# Arquitetura de rotas — Kero Mais

Roteamento file-based (TanStack Router). Cada arquivo em `src/routes/` vira uma rota.

## Módulos

- **Público** (`/`, `/cardapio`, `/promocoes`, `/sobre`, `/contato`, `/checkout`, `/auth`)
- **Cliente logado** (`_authenticated/`) — `/conta`, `/conta/pedidos`, `/conta/enderecos`
- **Admin** (`_admin/`) — `/admin`, `/admin/pedidos`, `/admin/produtos`, `/admin/categorias`, `/admin/promocoes`, `/admin/cupons`, `/admin/clientes`, `/admin/funcionarios`, `/admin/relatorios`, `/admin/config`
- **Cozinha (KDS)** (`_kitchen/`) — `/kds`

## Convenções

- Arquivos com prefixo `_` são **pathless layouts** (não aparecem na URL, mas gateiam a subárvore).
- Cada rota define seu próprio `head()` com `title`, `description` e Open Graph.
- Rotas privadas incluem `robots: noindex`.
- `sitemap.xml` e `robots.txt` cobrem só as rotas públicas indexáveis.

## Guards (a serem ativados com Lovable Cloud)

- `_authenticated/route.tsx` → `ssr:false` + `supabase.auth.getUser()` redirecionando para `/auth`.
- `_admin/route.tsx` → mesmo gate + verificação `has_role(user.id, 'admin')` via server fn.
- `_kitchen/route.tsx` → gate + `has_role(user.id, 'kitchen' | 'admin')`.
