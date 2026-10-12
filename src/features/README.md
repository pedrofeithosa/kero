# Features

Cada pasta abaixo agrupa a lógica de um domínio (hooks, services, componentes específicos, tipos locais).

- `menu/` — produtos, categorias, busca, filtros
- `cart/` — estado do carrinho (Zustand + persist), regras de precificação
- `checkout/` — steps de entrega/retirada, pagamento, revisão
- `orders/` — criação, status, timeline, histórico
- `auth/` — login, cadastro, recuperação de senha
- `customer/` — perfil, endereços, favoritos
- `admin/` — CRUDs administrativos
- `kitchen/` — fila do KDS, transições de status, impressão
- `promotions/` — banners, regras, cupons
- `delivery/` — zonas de entrega, cálculo de frete, ETA

Componentes puramente visuais e reutilizáveis vivem em `src/components/`. Features consomem componentes.
