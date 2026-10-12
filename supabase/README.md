# Banco de dados da Kero Mais (Supabase)

## Aplicar no projeto novo
Opção A (SQL Editor do Supabase): rode, **um arquivo por vez e nesta ordem**, tudo de `supabase/migrations/`
(são 6 arquivos, ordenados pelo nome). Depois, só para testar, rode `supabase/seed.sql`.

Opção B (CLI): `supabase link --project-ref <ref>` e `supabase db push`.

## Notas
- `seed.sql` é cardápio de DEMONSTRAÇÃO (itens fictícios do Lovable). Apague e cadastre o cardápio real no /admin antes de entregar.
- A pasta `drizzle/` é a cópia antiga das migrações do Lovable. Vale a `supabase/migrations`.
- Preço, opções, disponibilidade e loja aberta/fechada são validados no banco (`create_order`), nunca pelo navegador.

## Criar o primeiro administrador
Nada cria o primeiro admin sozinho. Faça assim: cadastre-se em `/auth` com o e-mail da Kero Mais, copie o `id` do usuário em
Supabase → Authentication → Users e rode no SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role) VALUES ('COLE-O-ID-AQUI', 'admin');
```

Atenção: a migração inicial também cadastra cupons de exemplo (ex.: BEMVINDO15). Desative-os no /admin/cupons se não forem valer.

## Adicionais compartilhados (migração 20260809000000)
Cadastre os adicionais uma vez em **/admin/adicionais** e escolha em quais categorias valem. Mexeu ali, mudou em todos os lanches.

Para aproveitar o grupo "Adicionais" que você já montou em UM lanche (troque `Cheeseburger` pelo nome do lanche), rode no SQL Editor:

```sql
UPDATE public.product_option_groups g
SET is_shared = true, product_id = NULL, category_ids = '{}'
FROM public.products p
WHERE g.product_id = p.id AND p.name = 'Cheeseburger' AND g.name = 'Adicionais';
```
Depois, em /admin/adicionais, escolha as categorias onde ele deve aparecer. Só então, se quiser limpar os "Adicionais" repetidos dos outros lanches:

```sql
DELETE FROM public.product_option_groups WHERE product_id IS NOT NULL AND name = 'Adicionais';
```
(apaga os grupos próprios chamados "Adicionais" de todos os produtos; os compartilhados não são afetados)

## Ingredientes (migração 20260811000000)
O campo **Ingredientes** do produto (admin) agora aparece para o cliente e gera as opções "Sem …".
Coloque `*` depois do que não pode ser retirado: `pão*, hambúrguer 180g*, alface, tomate, cheddar`.
Os grupos "Retirar ingredientes" antigos (fixos) ficam escondidos no site. Para tirá-los também do admin:

```sql
DELETE FROM public.product_option_groups
WHERE product_id IS NOT NULL AND lower(trim(name)) = 'retirar ingredientes';
```
