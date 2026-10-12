-- Kero Mais — "Retirar ingredientes" sai do campo Ingredientes do produto.
--
-- O site monta as opções "Sem <ingrediente>" a partir do que o admin digitou em Ingredientes
-- (itens terminados em * não podem ser retirados). Aqui o banco confere o pedido: só aceita
-- retirar o que está cadastrado como removível, e grava "Sem X" nas opções do item
-- (a cozinha e a comanda já mostram essas opções).

CREATE OR REPLACE FUNCTION public.create_order(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_customer public.customers%ROWTYPE;
  v_items jsonb := coalesce(payload->'items','[]'::jsonb);
  v_item jsonb;
  v_opt jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_line_opts jsonb;
  v_delivery public.delivery_type := coalesce(payload->>'delivery_type','delivery')::public.delivery_type;
  v_payment public.payment_method := (payload->>'payment_method')::public.payment_method;
  v_address jsonb := payload->'address';
  v_scheduled timestamptz := nullif(payload->>'scheduled_for','')::timestamptz;
  v_store jsonb;
  v_zone jsonb;
  v_coupon jsonb;
  v_product public.products%ROWTYPE;
  v_option record;
  v_rm text;
  v_ing text;
  v_group record;
  v_qty int;
  v_delta numeric;
  v_unit numeric;
  v_count int;
  v_product_ids text[] := '{}';
  v_category_ids text[] := '{}';
  v_subtotal numeric := 0;
  v_fee numeric := 0;
  v_discount numeric := 0;
  v_eta integer := 30;
  v_address_id uuid;
  v_order public.orders%ROWTYPE;
BEGIN
  IF jsonb_typeof(v_items) <> 'array' OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'Seu carrinho está vazio.';
  END IF;
  IF jsonb_array_length(v_items) > 40 THEN
    RAISE EXCEPTION 'Quantidade de itens acima do permitido.';
  END IF;
  IF v_payment IS NULL THEN
    RAISE EXCEPTION 'Selecione uma forma de pagamento.';
  END IF;

  -- horário
  v_store := public.store_status();
  IF NOT (v_store->>'open')::boolean AND v_scheduled IS NULL THEN
    RAISE EXCEPTION 'Estamos fechados no momento. Agende seu pedido para o próximo horário de funcionamento.';
  END IF;

  -- itens: preço, nome e opções vêm SEMPRE do banco
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items) LOOP
    v_qty := (v_item->>'quantity')::int;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 50 THEN
      RAISE EXCEPTION 'Quantidade inválida em um dos itens.';
    END IF;

    SELECT * INTO v_product FROM public.products
     WHERE id = (v_item->>'product_id')::uuid AND is_active AND archived_at IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Um item do carrinho não existe mais. Atualize o cardápio e tente de novo.';
    END IF;
    IF v_product.availability <> 'available' THEN
      RAISE EXCEPTION '% está indisponível no momento.', v_product.name;
    END IF;

    v_delta := 0;
    v_line_opts := '[]'::jsonb;
    FOR v_opt IN SELECT * FROM jsonb_array_elements(coalesce(v_item->'product_options','[]'::jsonb)) LOOP
      SELECT o.id AS option_id, o.name, o.price_delta, g.id AS group_id
        INTO v_option
        FROM public.product_options o
        JOIN public.product_option_groups g ON g.id = o.group_id
       WHERE o.id = (v_opt->>'option_id')::uuid
         AND (g.product_id = v_product.id
              OR (g.is_shared
                  AND (cardinality(g.category_ids) = 0 OR v_product.category_id = ANY (g.category_ids))))
         AND o.is_active AND g.is_active;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Uma opção escolhida em % não está mais disponível.', v_product.name;
      END IF;
      v_delta := v_delta + v_option.price_delta;
      v_line_opts := v_line_opts || jsonb_build_object(
        'group_id', v_option.group_id, 'option_id', v_option.option_id,
        'name', v_option.name, 'price_delta', v_option.price_delta);
    END LOOP;

    -- regras dos grupos (obrigatório, mínimo, máximo, escolha única)
    FOR v_group IN
      SELECT id, name, type, required, min_select, max_select
        FROM public.product_option_groups
       WHERE is_active
         AND (product_id = v_product.id
              OR (is_shared
                  AND (cardinality(category_ids) = 0 OR v_product.category_id = ANY (category_ids))))
    LOOP
      SELECT count(*) INTO v_count FROM jsonb_array_elements(v_line_opts) x
       WHERE (x->>'group_id')::uuid = v_group.id;
      IF v_count < greatest(v_group.min_select, CASE WHEN v_group.required THEN 1 ELSE 0 END) THEN
        RAISE EXCEPTION 'Escolha uma opção em "%" para %.', v_group.name, v_product.name;
      END IF;
      IF v_count > coalesce(v_group.max_select, CASE WHEN v_group.type = 'single' THEN 1 ELSE 1000 END) THEN
        RAISE EXCEPTION 'Muitas opções em "%" para %.', v_group.name, v_product.name;
      END IF;
    END LOOP;

    -- ingredientes retirados: só os marcados como removíveis no cadastro (sem * no final)
    FOR v_rm IN SELECT jsonb_array_elements_text(coalesce(v_item->'removed_ingredients','[]'::jsonb)) LOOP
      SELECT i INTO v_ing FROM unnest(v_product.ingredients) AS i
       WHERE right(trim(i), 1) <> '*' AND lower(trim(i)) = lower(trim(v_rm)) LIMIT 1;
      IF v_ing IS NULL THEN
        RAISE EXCEPTION 'O ingrediente "%" não pode ser retirado de %.', v_rm, v_product.name;
      END IF;
      v_line_opts := v_line_opts || jsonb_build_object('name', 'Sem ' || trim(v_ing), 'price_delta', 0);
    END LOOP;

    v_unit := v_product.price + v_delta;
    v_subtotal := v_subtotal + round(v_unit * v_qty, 2);
    v_product_ids := v_product_ids || v_product.id::text;
    IF v_product.category_id IS NOT NULL THEN
      v_category_ids := v_category_ids || v_product.category_id::text;
    END IF;

    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id::text,
      'product_name', v_product.name,
      'product_image', v_product.image_url,
      'category_id', v_product.category_id::text,
      'quantity', v_qty,
      'unit_price', v_unit,
      'total', round(v_unit * v_qty, 2),
      'observations', left(coalesce(v_item->>'observations',''), 300),
      'product_options', v_line_opts);
  END LOOP;

  -- entrega
  IF v_delivery = 'delivery' THEN
    IF v_address IS NULL OR coalesce(v_address->>'district','') = '' THEN
      RAISE EXCEPTION 'Informe o endereço de entrega.';
    END IF;
    v_zone := public.check_delivery_area(v_address->>'district', v_address->>'city');
    IF NOT (v_zone->>'available')::boolean THEN
      RAISE EXCEPTION '%', v_zone->>'reason';
    END IF;
    v_fee := (v_zone->>'fee')::numeric;
    v_eta := (v_zone->>'eta_minutes')::int;
    IF (v_zone->>'free_from') IS NOT NULL AND v_subtotal >= (v_zone->>'free_from')::numeric THEN
      v_fee := 0;
    END IF;
    IF v_subtotal < (v_zone->>'min_order_total')::numeric THEN
      RAISE EXCEPTION 'Pedido mínimo para este bairro: R$ %', to_char((v_zone->>'min_order_total')::numeric,'FM999990D00');
    END IF;
  ELSE
    v_eta := 20;
  END IF;

  -- cupom (produtos e categorias vêm do banco, não do cliente)
  IF coalesce(payload->>'coupon_code','') <> '' THEN
    v_coupon := public.validate_coupon(payload->>'coupon_code', v_subtotal, v_fee, v_category_ids, v_product_ids);
    IF NOT (v_coupon->>'valid')::boolean THEN
      RAISE EXCEPTION '%', v_coupon->>'reason';
    END IF;
    v_discount := (v_coupon->>'discount')::numeric;
  END IF;

  -- cliente
  IF v_uid IS NOT NULL THEN
    SELECT * INTO v_customer FROM public.customers WHERE user_id = v_uid;
  END IF;
  IF v_customer.id IS NULL THEN
    INSERT INTO public.customers (user_id, name, phone, email)
    VALUES (v_uid, payload->'customer'->>'name', payload->'customer'->>'phone',
            nullif(payload->'customer'->>'email',''))
    RETURNING * INTO v_customer;
  ELSE
    UPDATE public.customers SET
      name = coalesce(nullif(payload->'customer'->>'name',''), name),
      phone = coalesce(nullif(payload->'customer'->>'phone',''), phone),
      email = coalesce(nullif(payload->'customer'->>'email',''), email)
    WHERE id = v_customer.id RETURNING * INTO v_customer;
  END IF;

  -- endereço salvo (somente usuários logados)
  IF v_delivery = 'delivery' AND v_uid IS NOT NULL AND coalesce((payload->>'save_address')::boolean, false) THEN
    INSERT INTO public.delivery_addresses
      (customer_id, zip, street, number, complement, district, city, state, reference, is_favorite)
    VALUES (v_customer.id, v_address->>'zip', v_address->>'street', v_address->>'number',
            nullif(v_address->>'complement',''), v_address->>'district', v_address->>'city',
            v_address->>'state', nullif(v_address->>'reference',''),
            coalesce((v_address->>'is_favorite')::boolean, false))
    RETURNING id INTO v_address_id;
  ELSIF v_delivery = 'delivery' AND nullif(payload->>'address_id','') IS NOT NULL THEN
    v_address_id := (payload->>'address_id')::uuid;
  END IF;

  INSERT INTO public.orders (
    customer_id, user_id, delivery_type, payment_method, change_for,
    address_id, address_snapshot, customer_snapshot, zone_id,
    subtotal, delivery_fee, discount, total, coupon_id, coupon_code,
    eta_minutes, scheduled_for, notes
  ) VALUES (
    v_customer.id, v_uid, v_delivery, v_payment,
    nullif(payload->>'change_for','')::numeric,
    v_address_id,
    CASE WHEN v_delivery = 'delivery' THEN v_address ELSE NULL END,
    jsonb_build_object('name', v_customer.name, 'phone', v_customer.phone, 'email', v_customer.email),
    nullif(v_zone->>'zone_id','')::uuid,
    v_subtotal, v_fee, v_discount, greatest(0, v_subtotal + v_fee - v_discount),
    nullif(v_coupon->>'coupon_id','')::uuid, v_coupon->>'code',
    v_eta, v_scheduled, nullif(payload->>'notes','')
  ) RETURNING * INTO v_order;

  INSERT INTO public.order_items
    (order_id, product_id, product_name, product_image, category_id, quantity, unit_price, total, observations, product_options)
  SELECT v_order.id, l->>'product_id', l->>'product_name', l->>'product_image', l->>'category_id',
         (l->>'quantity')::int, (l->>'unit_price')::numeric, (l->>'total')::numeric,
         nullif(l->>'observations',''), l->'product_options'
  FROM jsonb_array_elements(v_lines) AS l;

  INSERT INTO public.payments (order_id, method, status, amount)
  VALUES (v_order.id, v_payment, 'pending', v_order.total);

  IF v_order.coupon_id IS NOT NULL THEN
    UPDATE public.coupons SET uses_count = uses_count + 1 WHERE id = v_order.coupon_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_order.id, 'number', v_order.number, 'tracking_token', v_order.tracking_token,
    'total', v_order.total, 'eta_minutes', v_order.eta_minutes, 'status', v_order.status
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO anon, authenticated;
