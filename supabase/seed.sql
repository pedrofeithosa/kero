-- Kero Mais — DADOS DE DEMONSTRAÇÃO do cardápio.
-- São os lanches de exemplo que vieram do Lovable (nomes, preços e fotos fictícios).
-- Use só para testar. Antes de entregar, apague tudo isto no painel e cadastre o cardápio REAL.
-- Seguro rodar mais de uma vez (ON CONFLICT DO NOTHING).

INSERT INTO public.categories (slug, name, description, position) VALUES ('burgers', 'Hambúrgueres', 'Blends artesanais grelhados na chapa, no pão brioche da casa.', 1) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (slug, name, description, position) VALUES ('hotdogs', 'Hot Dogs', 'Salsichas artesanais com coberturas generosas e pão macio.', 2) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (slug, name, description, position) VALUES ('combos', 'Combos', 'Lanche + acompanhamento + bebida com preço fechado.', 3) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (slug, name, description, position) VALUES ('drinks', 'Bebidas', 'Refrigerantes, sucos naturais e milk-shakes bem gelados.', 4) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (slug, name, description, position) VALUES ('desserts', 'Sobremesas', 'O final doce perfeito para o seu pedido.', 5) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'kero-classic', 'Kero Classic', 'Blend 180g, cheddar, alface, tomate e molho da casa no pão brioche.', ARRAY['blend bovino','cheddar','alface','tomate','molho da casa','pão brioche']::text[], 29.9, 34.9, 'ds-burger.jpg', 18, 'available', true, false, 1, 980, '2025-02-10'::timestamptz
FROM public.categories c WHERE c.slug = 'burgers' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Ponto da carne', 'Escolha 1 opção.', 'single', true, 1, 1, 1
FROM public.products pr WHERE pr.slug = 'kero-classic'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Ponto da carne');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bem passado', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bem passado');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ao ponto', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ao ponto');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Mal passado', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Mal passado');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 2
FROM public.products pr WHERE pr.slug = 'kero-classic'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', 'Turbine seu lanche (até 5 itens).', 'multiple', false, 0, 5, 3
FROM public.products pr WHERE pr.slug = 'kero-classic'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bacon crocante', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bacon crocante');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar cremoso', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar cremoso');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ovo', 3.5, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ovo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Carne extra 180g', 12, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Carne extra 180g');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Catupiry', 5.5, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Catupiry');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cebola crispy', 4, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cebola crispy');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Molho extra', 'Até 2 molhos.', 'multiple', false, 0, 2, 4
FROM public.products pr WHERE pr.slug = 'kero-classic'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Molho extra');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Molho da casa', 2, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Molho da casa');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Barbecue', 2, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Barbecue');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Picante', 2, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-classic' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Picante');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'kero-bacon', 'Kero Bacon Duplo', 'Dois blends 160g, bacon crocante, cheddar duplo e cebola caramelizada.', ARRAY['blend bovino','bacon','cheddar','cebola caramelizada']::text[], 39.9, NULL, 'cat-burgers.jpg', 22, 'available', true, false, 2, 742, '2025-04-02'::timestamptz
FROM public.categories c WHERE c.slug = 'burgers' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Ponto da carne', 'Escolha 1 opção.', 'single', true, 1, 1, 1
FROM public.products pr WHERE pr.slug = 'kero-bacon'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Ponto da carne');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bem passado', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bem passado');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ao ponto', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ao ponto');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Mal passado', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Mal passado');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 2
FROM public.products pr WHERE pr.slug = 'kero-bacon'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola caramelizada', 0, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola caramelizada');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', 'Turbine seu lanche (até 5 itens).', 'multiple', false, 0, 5, 3
FROM public.products pr WHERE pr.slug = 'kero-bacon'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bacon crocante', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bacon crocante');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar cremoso', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar cremoso');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ovo', 3.5, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ovo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Carne extra 180g', 12, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Carne extra 180g');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Catupiry', 5.5, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Catupiry');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cebola crispy', 4, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cebola crispy');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Molho extra', 'Até 2 molhos.', 'multiple', false, 0, 2, 4
FROM public.products pr WHERE pr.slug = 'kero-bacon'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Molho extra');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Molho da casa', 2, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Molho da casa');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Barbecue', 2, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Barbecue');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Picante', 2, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'kero-bacon' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Picante');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'crispy-chicken', 'Crispy Chicken', 'Frango empanado crocante, alface fresca e molho especial levemente picante.', ARRAY['frango empanado','alface','molho picante','maionese']::text[], 27.9, NULL, 'prod-chicken.jpg', 16, 'available', false, true, 3, 310, '2026-06-18'::timestamptz
FROM public.categories c WHERE c.slug = 'burgers' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 1
FROM public.products pr WHERE pr.slug = 'crispy-chicken'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', 'Turbine seu lanche (até 4 itens).', 'multiple', false, 0, 4, 2
FROM public.products pr WHERE pr.slug = 'crispy-chicken'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bacon crocante', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bacon crocante');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar cremoso', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar cremoso');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ovo', 3.5, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ovo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Carne extra 180g', 12, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Carne extra 180g');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Catupiry', 5.5, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Catupiry');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cebola crispy', 4, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cebola crispy');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Molho extra', 'Até 2 molhos.', 'multiple', false, 0, 2, 3
FROM public.products pr WHERE pr.slug = 'crispy-chicken'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Molho extra');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Molho da casa', 2, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Molho da casa');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Barbecue', 2, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Barbecue');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Picante', 2, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'crispy-chicken' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Picante');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'veggie-kero', 'Veggie Kero', 'Hambúrguer de grão-de-bico, queijo vegano, rúcula e tomate seco.', ARRAY['grão-de-bico','queijo vegano','rúcula','tomate seco']::text[], 26.9, NULL, 'cat-combos.jpg', 15, 'sold_out', false, true, 4, 88, '2026-07-05'::timestamptz
FROM public.categories c WHERE c.slug = 'burgers' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 1
FROM public.products pr WHERE pr.slug = 'veggie-kero'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate seco', 0, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate seco');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Molho extra', 'Até 2 molhos.', 'multiple', false, 0, 2, 2
FROM public.products pr WHERE pr.slug = 'veggie-kero'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Molho extra');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Molho da casa', 2, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Molho da casa');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Barbecue', 2, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Barbecue');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Picante', 2, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'veggie-kero' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Picante');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'dog-cheddar', 'Dog Cheddar Bacon', 'Salsicha artesanal, cheddar cremoso, bacon e cebola crispy.', ARRAY['salsicha artesanal','cheddar','bacon','cebola crispy']::text[], 22.9, NULL, 'prod-hotdog.jpg', 12, 'available', true, false, 5, 654, '2025-05-20'::timestamptz
FROM public.categories c WHERE c.slug = 'hotdogs' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 1
FROM public.products pr WHERE pr.slug = 'dog-cheddar'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem batata palha', 0, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem batata palha');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', 'Turbine seu lanche (até 4 itens).', 'multiple', false, 0, 4, 2
FROM public.products pr WHERE pr.slug = 'dog-cheddar'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bacon crocante', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bacon crocante');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar cremoso', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar cremoso');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ovo', 3.5, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ovo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Carne extra 180g', 12, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Carne extra 180g');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Catupiry', 5.5, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Catupiry');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cebola crispy', 4, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cebola crispy');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Molho extra', 'Até 2 molhos.', 'multiple', false, 0, 2, 3
FROM public.products pr WHERE pr.slug = 'dog-cheddar'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Molho extra');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Molho da casa', 2, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Molho da casa');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Barbecue', 2, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Barbecue');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Picante', 2, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-cheddar' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Picante');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'dog-tradicional', 'Dog Tradicional', 'Salsicha, purê, milho, ervilha, batata palha e molho de tomate caseiro.', ARRAY['salsicha','purê','milho','ervilha','batata palha']::text[], 18.9, 21.9, 'cat-hotdogs.jpg', 10, 'available', false, false, 6, 880, '2024-11-11'::timestamptz
FROM public.categories c WHERE c.slug = 'hotdogs' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 1
FROM public.products pr WHERE pr.slug = 'dog-tradicional'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem purê', 0, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem purê');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem ervilha', 0, 7
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem ervilha');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', 'Turbine seu lanche (até 3 itens).', 'multiple', false, 0, 3, 2
FROM public.products pr WHERE pr.slug = 'dog-tradicional'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bacon crocante', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bacon crocante');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar cremoso', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar cremoso');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ovo', 3.5, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ovo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Carne extra 180g', 12, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Carne extra 180g');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Catupiry', 5.5, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Catupiry');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cebola crispy', 4, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cebola crispy');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Molho extra', 'Até 2 molhos.', 'multiple', false, 0, 2, 3
FROM public.products pr WHERE pr.slug = 'dog-tradicional'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Molho extra');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Molho da casa', 2, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Molho da casa');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Barbecue', 2, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Barbecue');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Picante', 2, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'dog-tradicional' AND g.name = 'Molho extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Picante');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'combo-kero-mais', 'Combo Kero Mais', 'Hambúrguer artesanal + batata crocante + bebida gelada 350ml.', ARRAY['hambúrguer','batata frita','bebida']::text[], 44.9, 52.9, 'ds-combo.jpg', 25, 'available', true, false, 7, 1210, '2025-01-08'::timestamptz
FROM public.categories c WHERE c.slug = 'combos' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Ponto da carne', 'Escolha 1 opção.', 'single', true, 1, 1, 1
FROM public.products pr WHERE pr.slug = 'combo-kero-mais'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Ponto da carne');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bem passado', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bem passado');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ao ponto', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ao ponto');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Mal passado', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Ponto da carne'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Mal passado');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Escolha a bebida', 'Escolha 1 opção.', 'single', true, 1, 1, 2
FROM public.products pr WHERE pr.slug = 'combo-kero-mais'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Escolha a bebida');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Refrigerante lata 350ml', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Refrigerante lata 350ml');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Suco natural 300ml', 3, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Suco natural 300ml');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Milk-shake 300ml', 8, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Milk-shake 300ml');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 3
FROM public.products pr WHERE pr.slug = 'combo-kero-mais'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', 'Turbine seu lanche (até 5 itens).', 'multiple', false, 0, 5, 4
FROM public.products pr WHERE pr.slug = 'combo-kero-mais'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bacon crocante', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bacon crocante');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar cremoso', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar cremoso');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ovo', 3.5, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ovo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Carne extra 180g', 12, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Carne extra 180g');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Catupiry', 5.5, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Catupiry');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cebola crispy', 4, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kero-mais' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cebola crispy');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'combo-duplo', 'Combo Duplo Casal', '2 hambúrgueres, 2 batatas médias e 2 bebidas para dividir.', ARRAY['2 hambúrgueres','2 batatas','2 bebidas']::text[], 79.9, 94.9, 'promo-week.jpg', 30, 'available', false, false, 8, 420, '2026-03-12'::timestamptz
FROM public.categories c WHERE c.slug = 'combos' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Escolha a bebida', 'Escolha 1 opção.', 'single', true, 1, 1, 1
FROM public.products pr WHERE pr.slug = 'combo-duplo'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Escolha a bebida');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Refrigerante lata 350ml', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Refrigerante lata 350ml');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Suco natural 300ml', 3, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Suco natural 300ml');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Milk-shake 300ml', 8, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Milk-shake 300ml');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 2
FROM public.products pr WHERE pr.slug = 'combo-duplo'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', 'Turbine seu lanche (até 5 itens).', 'multiple', false, 0, 5, 3
FROM public.products pr WHERE pr.slug = 'combo-duplo'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bacon crocante', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bacon crocante');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cheddar cremoso', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cheddar cremoso');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Ovo', 3.5, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Ovo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Carne extra 180g', 12, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Carne extra 180g');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Catupiry', 5.5, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Catupiry');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cebola crispy', 4, 6
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-duplo' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cebola crispy');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'combo-kids', 'Combo Kids', 'Mini burger, batata pequena, suco natural e sobremesa surpresa.', ARRAY['mini burger','batata','suco','sobremesa']::text[], 32.9, NULL, 'cat-promos.jpg', 18, 'available', false, false, 9, 260, '2025-09-01'::timestamptz
FROM public.categories c WHERE c.slug = 'combos' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Retirar ingredientes', 'Escolha o que não vai no seu lanche.', 'multiple', false, 0, NULL, 1
FROM public.products pr WHERE pr.slug = 'combo-kids'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Retirar ingredientes');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem cebola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem cebola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem tomate', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem tomate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem alface', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem alface');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem milho', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem milho');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem picles', 0, 5
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Retirar ingredientes'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem picles');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Escolha a bebida', 'Escolha 1 opção.', 'single', true, 1, 1, 2
FROM public.products pr WHERE pr.slug = 'combo-kids'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Escolha a bebida');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Refrigerante lata 350ml', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Refrigerante lata 350ml');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Suco natural 300ml', 3, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Suco natural 300ml');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Milk-shake 300ml', 8, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'combo-kids' AND g.name = 'Escolha a bebida'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Milk-shake 300ml');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'refrigerante-lata', 'Refrigerante Lata 350ml', 'Coca-Cola, Guaraná, Fanta ou Sprite bem gelados.', ARRAY['refrigerante']::text[], 7.9, NULL, 'cat-drinks.jpg', 2, 'available', false, false, 10, 1540, '2024-08-01'::timestamptz
FROM public.categories c WHERE c.slug = 'drinks' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Sabor', NULL, 'single', true, 1, 1, 1
FROM public.products pr WHERE pr.slug = 'refrigerante-lata'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Sabor');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Coca-Cola', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'refrigerante-lata' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Coca-Cola');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Guaraná', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'refrigerante-lata' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Guaraná');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Fanta Laranja', 0, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'refrigerante-lata' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Fanta Laranja');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sprite', 0, 4
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'refrigerante-lata' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sprite');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Gelo', NULL, 'single', true, 1, 1, 2
FROM public.products pr WHERE pr.slug = 'refrigerante-lata'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Gelo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Com gelo', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'refrigerante-lata' AND g.name = 'Gelo'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Com gelo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem gelo', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'refrigerante-lata' AND g.name = 'Gelo'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem gelo');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'suco-natural', 'Suco Natural 500ml', 'Feito na hora com frutas frescas selecionadas.', ARRAY['fruta','água','açúcar opcional']::text[], 12.9, NULL, 'cat-drinks.jpg', 6, 'available', false, true, 11, 190, '2026-05-22'::timestamptz
FROM public.categories c WHERE c.slug = 'drinks' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Sabor', NULL, 'single', true, 1, 1, 1
FROM public.products pr WHERE pr.slug = 'suco-natural'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Sabor');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Laranja', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'suco-natural' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Laranja');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Morango', 2, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'suco-natural' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Morango');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Maracujá', 1, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'suco-natural' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Maracujá');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Açúcar', NULL, 'single', true, 1, 1, 2
FROM public.products pr WHERE pr.slug = 'suco-natural'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Açúcar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Com açúcar', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'suco-natural' AND g.name = 'Açúcar'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Com açúcar');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem açúcar', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'suco-natural' AND g.name = 'Açúcar'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem açúcar');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Gelo', NULL, 'single', true, 1, 1, 3
FROM public.products pr WHERE pr.slug = 'suco-natural'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Gelo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Com gelo', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'suco-natural' AND g.name = 'Gelo'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Com gelo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Sem gelo', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'suco-natural' AND g.name = 'Gelo'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Sem gelo');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'milk-shake', 'Milk-Shake 400ml', 'Cremoso, batido na hora, com calda e cobertura à sua escolha.', ARRAY['sorvete','leite','calda']::text[], 18.9, NULL, 'cat-drinks.jpg', 8, 'available', true, false, 12, 610, '2025-06-30'::timestamptz
FROM public.categories c WHERE c.slug = 'drinks' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Sabor', NULL, 'single', true, 1, 1, 1
FROM public.products pr WHERE pr.slug = 'milk-shake'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Sabor');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Chocolate', 0, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'milk-shake' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Chocolate');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Baunilha', 0, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'milk-shake' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Baunilha');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Cookies', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'milk-shake' AND g.name = 'Sabor'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Cookies');
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Cobertura extra', NULL, 'multiple', false, 0, 2, 2
FROM public.products pr WHERE pr.slug = 'milk-shake'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Cobertura extra');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Caramelo', 2.5, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'milk-shake' AND g.name = 'Cobertura extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Caramelo');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Nutella', 5, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'milk-shake' AND g.name = 'Cobertura extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Nutella');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Chantilly', 3, 3
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'milk-shake' AND g.name = 'Cobertura extra'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Chantilly');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'petit-gateau', 'Petit Gâteau', 'Bolo quente de chocolate com recheio cremoso e sorvete de creme.', ARRAY['chocolate','sorvete de creme']::text[], 21.9, NULL, 'cat-promos.jpg', 14, 'available', false, false, 13, 230, '2025-10-14'::timestamptz
FROM public.categories c WHERE c.slug = 'desserts' ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.product_option_groups (product_id, name, description, type, required, min_select, max_select, position)
SELECT pr.id, 'Adicionais', NULL, 'multiple', false, 0, 2, 1
FROM public.products pr WHERE pr.slug = 'petit-gateau'
AND NOT EXISTS (SELECT 1 FROM public.product_option_groups x WHERE x.product_id = pr.id AND x.name = 'Adicionais');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Bola extra de sorvete', 6, 1
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'petit-gateau' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Bola extra de sorvete');
INSERT INTO public.product_options (group_id, name, price_delta, position)
SELECT g.id, 'Castanhas', 4, 2
FROM public.product_option_groups g JOIN public.products pr ON pr.id = g.product_id
WHERE pr.slug = 'petit-gateau' AND g.name = 'Adicionais'
AND NOT EXISTS (SELECT 1 FROM public.product_options x WHERE x.group_id = g.id AND x.name = 'Castanhas');

INSERT INTO public.products (category_id, slug, name, description, ingredients, price, compare_at, image_url, prep_time_minutes, availability, is_best_seller, is_new, position, sold_count, created_at)
SELECT c.id, 'brownie', 'Brownie da Casa', 'Brownie denso com nozes e calda quente de chocolate meio amargo.', ARRAY['chocolate','nozes']::text[], 15.9, NULL, 'cat-promos.jpg', 8, 'unavailable', false, false, 14, 120, '2025-03-19'::timestamptz
FROM public.categories c WHERE c.slug = 'desserts' ON CONFLICT (slug) DO NOTHING;

