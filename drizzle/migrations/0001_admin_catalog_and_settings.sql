-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','manager','attendant','kitchen')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','manager')
  );
$$;

-- ============ catalog ============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon USING (is_active AND archived_at IS NULL);
CREATE POLICY "categories auth read" ON public.categories FOR SELECT TO authenticated USING (is_active AND archived_at IS NULL OR public.is_staff(auth.uid()));
CREATE POLICY "categories manage" ON public.categories FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  ingredients text[] NOT NULL DEFAULT '{}',
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at numeric(10,2),
  image_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  prep_time_minutes integer NOT NULL DEFAULT 15,
  availability text NOT NULL DEFAULT 'available',
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  sold_count integer NOT NULL DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon USING (is_active AND archived_at IS NULL);
CREATE POLICY "products auth read" ON public.products FOR SELECT TO authenticated USING (is_active AND archived_at IS NULL OR public.is_staff(auth.uid()));
CREATE POLICY "products manage" ON public.products FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

CREATE TABLE public.product_option_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'multiple',
  required boolean NOT NULL DEFAULT false,
  min_select integer NOT NULL DEFAULT 0,
  max_select integer,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pog_product_idx ON public.product_option_groups(product_id);
GRANT SELECT ON public.product_option_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_option_groups TO authenticated;
GRANT ALL ON public.product_option_groups TO service_role;
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pog public read" ON public.product_option_groups FOR SELECT TO anon USING (is_active);
CREATE POLICY "pog auth read" ON public.product_option_groups FOR SELECT TO authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "pog manage" ON public.product_option_groups FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

CREATE TABLE public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_delta numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_options_group_idx ON public.product_options(group_id);
GRANT SELECT ON public.product_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_options TO authenticated;
GRANT ALL ON public.product_options TO service_role;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_options public read" ON public.product_options FOR SELECT TO anon USING (is_active);
CREATE POLICY "product_options auth read" ON public.product_options FOR SELECT TO authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "product_options manage" ON public.product_options FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- ============ promotions ============
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  promo_price numeric(10,2),
  discount_percent numeric(5,2),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  uses_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions public read" ON public.promotions FOR SELECT TO anon
  USING (is_active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY "promotions auth read" ON public.promotions FOR SELECT TO authenticated
  USING ((is_active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())) OR public.is_staff(auth.uid()));
CREATE POLICY "promotions manage" ON public.promotions FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- ============ staff ============
CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_profiles TO authenticated;
GRANT ALL ON public.staff_profiles TO service_role;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read self" ON public.staff_profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "staff update self" ON public.staff_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "staff manage" ON public.staff_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ store settings ============
CREATE TABLE public.store_settings (
  id boolean PRIMARY KEY DEFAULT true,
  company_name text NOT NULL DEFAULT 'Kero Mais',
  logo_url text,
  description text,
  phone text,
  whatsapp text,
  instagram text,
  street text,
  number text,
  district text,
  city text,
  state text,
  zip text,
  avg_prep_minutes integer NOT NULL DEFAULT 35,
  order_message text,
  whatsapp_auto_message text,
  whatsapp_support_message text,
  whatsapp_order_message text,
  store_state text NOT NULL DEFAULT 'auto',
  paused_message text,
  pay_pix boolean NOT NULL DEFAULT true,
  pay_cash boolean NOT NULL DEFAULT true,
  pay_card_on_delivery boolean NOT NULL DEFAULT true,
  pay_online boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_singleton CHECK (id)
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.store_settings FOR SELECT TO anon USING (true);
CREATE POLICY "settings auth read" ON public.store_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings manage" ON public.store_settings FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

INSERT INTO public.store_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

-- ============ activity logs ============
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_name text,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_logs_created_idx ON public.activity_logs(created_at DESC);
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs read staff" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));

CREATE OR REPLACE FUNCTION public.log_activity(_action text, _resource text, _resource_id text DEFAULT NULL, _details jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para registrar atividade';
  END IF;
  SELECT name INTO v_name FROM public.staff_profiles WHERE id = auth.uid();
  INSERT INTO public.activity_logs (actor_id, actor_name, action, resource, resource_id, details)
  VALUES (auth.uid(), COALESCE(v_name, 'Equipe'), _action, _resource, _resource_id, COALESCE(_details, '{}'::jsonb));
END;
$$;

-- ============ orders: cancellation + staff management ============
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_note text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE OR REPLACE FUNCTION public.admin_update_order_status(_order_id uuid, _status public.order_status, _reason text DEFAULT NULL, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;
  IF _status = 'cancelled' AND NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores e gerentes podem cancelar pedidos';
  END IF;
  UPDATE public.orders
     SET status = _status,
         updated_at = now(),
         cancel_reason = CASE WHEN _status = 'cancelled' THEN _reason ELSE cancel_reason END,
         cancel_note = CASE WHEN _status = 'cancelled' THEN _note ELSE cancel_note END,
         cancelled_at = CASE WHEN _status = 'cancelled' THEN now() ELSE cancelled_at END
   WHERE id = _order_id;
  INSERT INTO public.order_status_events (order_id, status, note)
  VALUES (_order_id, _status, COALESCE(_reason, _note));
  PERFORM public.log_activity('order.status', 'orders', _order_id::text, jsonb_build_object('status', _status, 'reason', _reason));
END;
$$;

-- ============ dashboard metrics ============
CREATE OR REPLACE FUNCTION public.admin_metrics(_from timestamptz, _to timestamptz)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_span interval := _to - _from;
  result json;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  SELECT json_build_object(
    'range', json_build_object('from', _from, 'to', _to),
    'current', (
      SELECT json_build_object(
        'revenue', COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0),
        'orders', COUNT(*) FILTER (WHERE status <> 'cancelled'),
        'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
        'avg_ticket', COALESCE(AVG(total) FILTER (WHERE status <> 'cancelled'), 0),
        'in_progress', COUNT(*) FILTER (WHERE status IN ('received','accepted','preparing','ready','out_for_delivery'))
      ) FROM public.orders WHERE created_at >= _from AND created_at < _to
    ),
    'previous', (
      SELECT json_build_object(
        'revenue', COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0),
        'orders', COUNT(*) FILTER (WHERE status <> 'cancelled'),
        'avg_ticket', COALESCE(AVG(total) FILTER (WHERE status <> 'cancelled'), 0),
        'has_data', COUNT(*) > 0
      ) FROM public.orders WHERE created_at >= _from - v_span AND created_at < _from
    ),
    'customers_total', (SELECT COUNT(*) FROM public.customers),
    'customers_new', (SELECT COUNT(*) FROM public.customers WHERE created_at >= _from AND created_at < _to),
    'by_day', (
      SELECT COALESCE(json_agg(row_to_json(d) ORDER BY d.day), '[]'::json) FROM (
        SELECT date_trunc('day', created_at)::date AS day,
               COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'),0) AS revenue,
               COUNT(*) FILTER (WHERE status <> 'cancelled') AS orders
        FROM public.orders WHERE created_at >= _from AND created_at < _to
        GROUP BY 1
      ) d
    ),
    'by_hour', (
      SELECT COALESCE(json_agg(row_to_json(h) ORDER BY h.hour), '[]'::json) FROM (
        SELECT EXTRACT(hour FROM created_at)::int AS hour, COUNT(*) AS orders
        FROM public.orders WHERE created_at >= _from AND created_at < _to AND status <> 'cancelled'
        GROUP BY 1
      ) h
    ),
    'by_payment', (
      SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json) FROM (
        SELECT payment_method::text AS method, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue
        FROM public.orders WHERE created_at >= _from AND created_at < _to AND status <> 'cancelled'
        GROUP BY 1
      ) p
    ),
    'top_products', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT oi.product_name AS name, SUM(oi.quantity)::int AS quantity, COALESCE(SUM(oi.total),0) AS revenue
        FROM public.order_items oi JOIN public.orders o ON o.id = oi.order_id
        WHERE o.created_at >= _from AND o.created_at < _to AND o.status <> 'cancelled'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 10
      ) t
    ),
    'top_categories', (
      SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json) FROM (
        SELECT COALESCE(oi.category_id, 'sem-categoria') AS category, SUM(oi.quantity)::int AS quantity, COALESCE(SUM(oi.total),0) AS revenue
        FROM public.order_items oi JOIN public.orders o ON o.id = oi.order_id
        WHERE o.created_at >= _from AND o.created_at < _to AND o.status <> 'cancelled'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 10
      ) c
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- ============ customer aggregates for admin ============
CREATE OR REPLACE FUNCTION public.admin_customers(_search text DEFAULT NULL, _limit integer DEFAULT 50, _offset integer DEFAULT 0)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result json;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;
  SELECT json_build_object(
    'total', (SELECT COUNT(*) FROM public.customers c
               WHERE _search IS NULL OR c.name ILIKE '%'||_search||'%' OR c.phone ILIKE '%'||_search||'%' OR COALESCE(c.email,'') ILIKE '%'||_search||'%'),
    'rows', COALESCE((
      SELECT json_agg(row_to_json(x)) FROM (
        SELECT c.id, c.name, c.phone, c.email, c.created_at,
               COUNT(o.id) FILTER (WHERE o.status <> 'cancelled') AS orders_count,
               COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS total_spent,
               MAX(o.created_at) AS last_order_at
        FROM public.customers c
        LEFT JOIN public.orders o ON o.customer_id = c.id
        WHERE _search IS NULL OR c.name ILIKE '%'||_search||'%' OR c.phone ILIKE '%'||_search||'%' OR COALESCE(c.email,'') ILIKE '%'||_search||'%'
        GROUP BY c.id
        ORDER BY MAX(o.created_at) DESC NULLS LAST
        LIMIT _limit OFFSET _offset
      ) x
    ), '[]'::json)
  ) INTO result;
  RETURN result;
END;
$$;