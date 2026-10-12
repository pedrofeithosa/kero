-- ============================================================
-- KERO MAIS — Módulo de Pedidos
-- ============================================================

-- ---------- ENUMS ----------
CREATE TYPE public.app_role AS ENUM ('admin', 'kitchen', 'customer');
CREATE TYPE public.delivery_type AS ENUM ('delivery', 'pickup');
CREATE TYPE public.order_status AS ENUM (
  'received','accepted','preparing','ready','out_for_delivery','delivered','cancelled'
);
CREATE TYPE public.payment_method AS ENUM ('pix','card_on_delivery','cash','online_card');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.coupon_type AS ENUM ('percent','fixed','free_shipping');
CREATE TYPE public.notification_audience AS ENUM ('customer','admin');

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ---------- USER ROLES ----------
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','kitchen')
  );
$$;

CREATE POLICY "Usuários veem os próprios papéis" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ---------- CUSTOMERS ----------
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customers_phone_idx ON public.customers (phone);
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Cliente gerencia o próprio cadastro" ON public.customers
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Cliente cria o próprio cadastro" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Cliente atualiza o próprio cadastro" ON public.customers
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ---------- ADDRESSES ----------
CREATE TABLE public.delivery_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label text,
  zip text NOT NULL,
  street text NOT NULL,
  number text NOT NULL,
  complement text,
  district text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  reference text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX delivery_addresses_customer_idx ON public.delivery_addresses (customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_addresses TO authenticated;
GRANT ALL ON public.delivery_addresses TO service_role;
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER delivery_addresses_updated_at BEFORE UPDATE ON public.delivery_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Cliente gerencia os próprios endereços" ON public.delivery_addresses
  FOR ALL TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));
CREATE POLICY "Equipe consulta endereços" ON public.delivery_addresses
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ---------- DELIVERY ZONES ----------
CREATE TABLE public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  city text NOT NULL DEFAULT 'São Paulo',
  state text NOT NULL DEFAULT 'SP',
  fee numeric(10,2) NOT NULL DEFAULT 0,
  eta_minutes integer NOT NULL DEFAULT 45,
  min_order_total numeric(10,2) NOT NULL DEFAULT 0,
  free_from numeric(10,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX delivery_zones_district_idx ON public.delivery_zones (lower(district), lower(city));
GRANT SELECT ON public.delivery_zones TO anon, authenticated;
GRANT ALL ON public.delivery_zones TO service_role;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zonas ativas são públicas" ON public.delivery_zones
  FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admin gerencia zonas" ON public.delivery_zones
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ---------- STORE HOURS ----------
CREATE TABLE public.store_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL UNIQUE,
  opens_at time NOT NULL DEFAULT '18:00',
  closes_at time NOT NULL DEFAULT '23:30',
  is_closed boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.store_hours TO anon, authenticated;
GRANT ALL ON public.store_hours TO service_role;
ALTER TABLE public.store_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Horários são públicos" ON public.store_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia horários" ON public.store_hours
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.store_special_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  label text,
  opens_at time,
  closes_at time,
  is_closed boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.store_special_dates TO anon, authenticated;
GRANT ALL ON public.store_special_dates TO service_role;
ALTER TABLE public.store_special_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Datas especiais são públicas" ON public.store_special_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia datas especiais" ON public.store_special_dates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ---------- COUPONS ----------
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type public.coupon_type NOT NULL,
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  min_order_total numeric(10,2) NOT NULL DEFAULT 0,
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  max_uses_per_customer integer,
  allowed_categories text[] NOT NULL DEFAULT '{}',
  allowed_products text[] NOT NULL DEFAULT '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cupons ativos são públicos" ON public.coupons
  FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admin gerencia cupons" ON public.coupons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ---------- ORDERS ----------
CREATE SEQUENCE public.order_number_seq START 125;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE DEFAULT nextval('public.order_number_seq'),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id uuid,
  tracking_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16),'hex'),
  status public.order_status NOT NULL DEFAULT 'received',
  delivery_type public.delivery_type NOT NULL DEFAULT 'delivery',
  payment_method public.payment_method NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  change_for numeric(10,2),
  address_id uuid REFERENCES public.delivery_addresses(id) ON DELETE SET NULL,
  address_snapshot jsonb,
  customer_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  zone_id uuid REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code text,
  eta_minutes integer NOT NULL DEFAULT 45,
  scheduled_for timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER SEQUENCE public.order_number_seq OWNED BY public.orders.number;
CREATE INDEX orders_customer_idx ON public.orders (customer_id);
CREATE INDEX orders_status_idx ON public.orders (status, created_at DESC);
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Cliente vê os próprios pedidos" ON public.orders
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Equipe atualiza pedidos" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ---------- ORDER ITEMS ----------
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_image text,
  category_id text,
  quantity integer NOT NULL CHECK (quantity >= 1 AND quantity <= 99),
  unit_price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  observations text,
  product_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items (order_id);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itens seguem o pedido" ON public.order_items
  FOR SELECT TO authenticated USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR public.is_staff(auth.uid())
  );

-- ---------- PAYMENTS ----------
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  method public.payment_method NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  transaction_id text,
  amount numeric(10,2) NOT NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON public.payments (order_id);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pagamentos seguem o pedido" ON public.payments
  FOR SELECT TO authenticated USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR public.is_staff(auth.uid())
  );
CREATE POLICY "Equipe atualiza pagamentos" ON public.payments
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ---------- STATUS HISTORY ----------
CREATE TABLE public.order_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_status_events_order_idx ON public.order_status_events (order_id, created_at);
GRANT SELECT ON public.order_status_events TO authenticated;
GRANT ALL ON public.order_status_events TO service_role;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Histórico segue o pedido" ON public.order_status_events
  FOR SELECT TO authenticated USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR public.is_staff(auth.uid())
  );

CREATE OR REPLACE FUNCTION public.log_order_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.order_status_events (order_id, status) VALUES (NEW.id, NEW.status);
    INSERT INTO public.notifications (order_id, audience, type, payload)
    VALUES
      (NEW.id, 'customer', 'order_' || NEW.status::text,
       jsonb_build_object('number', NEW.number, 'status', NEW.status)),
      (NEW.id, 'admin', 'order_' || NEW.status::text,
       jsonb_build_object('number', NEW.number, 'status', NEW.status));
  END IF;
  RETURN NEW;
END; $$;

-- ---------- NOTIFICATIONS ----------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  audience public.notification_audience NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_audience_idx ON public.notifications (audience, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notificações da equipe" ON public.notifications
  FOR SELECT TO authenticated USING (
    public.is_staff(auth.uid())
    OR (audience = 'customer' AND order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()))
  );
CREATE POLICY "Marcar notificação como lida" ON public.notifications
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER orders_status_log
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status();

-- ============================================================
-- FUNÇÕES DE NEGÓCIO
-- ============================================================

-- Loja aberta?
CREATE OR REPLACE FUNCTION public.store_status(_at timestamptz DEFAULT now())
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  local_ts timestamp;
  special public.store_special_dates%ROWTYPE;
  hours public.store_hours%ROWTYPE;
  o time; c time; open_now boolean;
BEGIN
  local_ts := (_at AT TIME ZONE 'America/Sao_Paulo');
  SELECT * INTO special FROM public.store_special_dates WHERE date = local_ts::date;
  IF FOUND THEN
    IF special.is_closed THEN
      RETURN jsonb_build_object('open', false, 'reason', coalesce(special.label,'Fechado hoje'));
    END IF;
    o := special.opens_at; c := special.closes_at;
  ELSE
    SELECT * INTO hours FROM public.store_hours WHERE weekday = EXTRACT(DOW FROM local_ts)::smallint;
    IF NOT FOUND OR hours.is_closed THEN
      RETURN jsonb_build_object('open', false, 'reason', 'Fechado hoje');
    END IF;
    o := hours.opens_at; c := hours.closes_at;
  END IF;
  open_now := local_ts::time >= o AND local_ts::time <= c;
  RETURN jsonb_build_object(
    'open', open_now,
    'opens_at', to_char(o,'HH24:MI'),
    'closes_at', to_char(c,'HH24:MI'),
    'reason', CASE WHEN open_now THEN NULL ELSE 'Fora do horário de funcionamento' END
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.store_status(timestamptz) TO anon, authenticated;

-- Consulta de área de entrega
CREATE OR REPLACE FUNCTION public.check_delivery_area(_district text, _city text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE z public.delivery_zones%ROWTYPE;
BEGIN
  SELECT * INTO z FROM public.delivery_zones
   WHERE is_active AND lower(district) = lower(trim(_district))
     AND (_city IS NULL OR lower(city) = lower(trim(_city)))
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Ainda não entregamos neste bairro.');
  END IF;
  RETURN jsonb_build_object(
    'available', true, 'zone_id', z.id, 'district', z.district, 'city', z.city,
    'fee', z.fee, 'eta_minutes', z.eta_minutes,
    'min_order_total', z.min_order_total, 'free_from', z.free_from
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.check_delivery_area(text, text) TO anon, authenticated;

-- Validação de cupom
CREATE OR REPLACE FUNCTION public.validate_coupon(
  _code text, _subtotal numeric, _delivery_fee numeric DEFAULT 0,
  _category_ids text[] DEFAULT '{}', _product_ids text[] DEFAULT '{}'
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE cp public.coupons%ROWTYPE; disc numeric := 0;
BEGIN
  SELECT * INTO cp FROM public.coupons WHERE upper(code) = upper(trim(_code)) AND is_active;
  IF NOT FOUND THEN RETURN jsonb_build_object('valid', false, 'reason', 'Cupom inválido.'); END IF;
  IF cp.starts_at IS NOT NULL AND now() < cp.starts_at THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Cupom ainda não está disponível.'); END IF;
  IF cp.ends_at IS NOT NULL AND now() > cp.ends_at THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Cupom expirado.'); END IF;
  IF cp.max_uses IS NOT NULL AND cp.uses_count >= cp.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Cupom esgotado.'); END IF;
  IF _subtotal < cp.min_order_total THEN
    RETURN jsonb_build_object('valid', false, 'reason',
      'Cupom válido a partir de R$ ' || to_char(cp.min_order_total,'FM999990D00')); END IF;
  IF array_length(cp.allowed_categories,1) IS NOT NULL AND NOT (cp.allowed_categories && _category_ids) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Cupom não vale para os itens do carrinho.'); END IF;
  IF array_length(cp.allowed_products,1) IS NOT NULL AND NOT (cp.allowed_products && _product_ids) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Cupom não vale para os itens do carrinho.'); END IF;

  disc := CASE cp.discount_type
    WHEN 'percent' THEN round(_subtotal * cp.discount_value / 100, 2)
    WHEN 'fixed' THEN cp.discount_value
    WHEN 'free_shipping' THEN coalesce(_delivery_fee, 0)
  END;
  disc := least(disc, _subtotal + coalesce(_delivery_fee,0));

  RETURN jsonb_build_object('valid', true, 'coupon_id', cp.id, 'code', cp.code,
    'discount_type', cp.discount_type, 'discount', disc, 'description', cp.description);
END; $$;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric, numeric, text[], text[]) TO anon, authenticated;

-- Criação do pedido (única porta de entrada, inclusive para visitantes)
CREATE OR REPLACE FUNCTION public.create_order(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_customer public.customers%ROWTYPE;
  v_items jsonb := coalesce(payload->'items','[]'::jsonb);
  v_item jsonb;
  v_delivery public.delivery_type := coalesce(payload->>'delivery_type','delivery')::public.delivery_type;
  v_payment public.payment_method := (payload->>'payment_method')::public.payment_method;
  v_address jsonb := payload->'address';
  v_scheduled timestamptz := nullif(payload->>'scheduled_for','')::timestamptz;
  v_store jsonb;
  v_zone jsonb;
  v_coupon jsonb;
  v_subtotal numeric := 0;
  v_fee numeric := 0;
  v_discount numeric := 0;
  v_eta integer := 30;
  v_address_id uuid;
  v_order public.orders%ROWTYPE;
BEGIN
  IF jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'Seu carrinho está vazio.';
  END IF;
  IF v_payment IS NULL THEN
    RAISE EXCEPTION 'Selecione uma forma de pagamento.';
  END IF;

  -- horário
  v_store := public.store_status();
  IF NOT (v_store->>'open')::boolean AND v_scheduled IS NULL THEN
    RAISE EXCEPTION 'Estamos fechados no momento. Agende seu pedido para o próximo horário de funcionamento.';
  END IF;

  -- subtotal a partir dos itens
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items) LOOP
    v_subtotal := v_subtotal + round((v_item->>'unit_price')::numeric * (v_item->>'quantity')::int, 2);
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

  -- cupom
  IF coalesce(payload->>'coupon_code','') <> '' THEN
    v_coupon := public.validate_coupon(
      payload->>'coupon_code', v_subtotal, v_fee,
      ARRAY(SELECT jsonb_array_elements_text(coalesce(payload->'category_ids','[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(coalesce(payload->'product_ids','[]'::jsonb)))
    );
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
  SELECT v_order.id, i->>'product_id', i->>'product_name', i->>'product_image', i->>'category_id',
         (i->>'quantity')::int, (i->>'unit_price')::numeric,
         round((i->>'unit_price')::numeric * (i->>'quantity')::int, 2),
         nullif(i->>'observations',''), coalesce(i->'product_options','[]'::jsonb)
  FROM jsonb_array_elements(v_items) AS i;

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

-- Acompanhamento por código secreto (visitantes)
CREATE OR REPLACE FUNCTION public.get_order_by_token(_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders%ROWTYPE; result jsonb;
BEGIN
  SELECT * INTO o FROM public.orders WHERE tracking_token = _token;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'id', o.id, 'number', o.number, 'status', o.status, 'delivery_type', o.delivery_type,
    'payment_method', o.payment_method, 'payment_status', o.payment_status,
    'change_for', o.change_for, 'address', o.address_snapshot, 'customer', o.customer_snapshot,
    'subtotal', o.subtotal, 'delivery_fee', o.delivery_fee, 'discount', o.discount, 'total', o.total,
    'coupon_code', o.coupon_code, 'eta_minutes', o.eta_minutes, 'scheduled_for', o.scheduled_for,
    'notes', o.notes, 'created_at', o.created_at,
    'items', coalesce((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.created_at) FROM public.order_items i WHERE i.order_id = o.id), '[]'::jsonb),
    'events', coalesce((SELECT jsonb_agg(jsonb_build_object('status', e.status, 'created_at', e.created_at) ORDER BY e.created_at) FROM public.order_status_events e WHERE e.order_id = o.id), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END; $$;
GRANT EXECUTE ON FUNCTION public.get_order_by_token(text) TO anon, authenticated;

-- ---------- REALTIME ----------
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_status_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_events;

-- ---------- SEEDS ----------
INSERT INTO public.store_hours (weekday, opens_at, closes_at, is_closed) VALUES
 (0,'18:00','23:00',false),(1,'18:00','23:00',true),(2,'18:00','23:30',false),
 (3,'18:00','23:30',false),(4,'18:00','23:30',false),(5,'18:00','00:00'::time - interval '1 minute',false),
 (6,'17:00','23:59',false);

INSERT INTO public.delivery_zones (district, city, state, fee, eta_minutes, min_order_total, free_from) VALUES
 ('Centro','São Paulo','SP',6.90,35,20,60),
 ('Jardim América','São Paulo','SP',8.90,45,25,80),
 ('Vila Nova','São Paulo','SP',9.90,50,25,80),
 ('Bela Vista','São Paulo','SP',7.90,40,20,70),
 ('Santa Cecília','São Paulo','SP',8.90,45,25,80),
 ('Pinheiros','São Paulo','SP',11.90,55,30,90);

INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_total, is_active) VALUES
 ('KERO10','10% de desconto no pedido','percent',10,40,true),
 ('BEMVINDO15','15% para o primeiro pedido','percent',15,60,true),
 ('FRETE0','Frete grátis','free_shipping',0,50,true);