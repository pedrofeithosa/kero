-- Kero Mais — entrega em TODA a cidade (Pedreira) sem precisar cadastrar bairro por bairro.
--
-- Como funciona:
--  1) Bairro cadastrado em delivery_zones  -> usa a taxa/tempo daquele bairro (como antes).
--  2) Bairro NÃO cadastrado                -> usa a zona "Demais bairros" da mesma cidade (se estiver ativa).
--  3) Cidade sem nenhuma zona ativa        -> "Entregamos apenas em Pedreira."
-- A taxa dos "Demais bairros" é definida em /admin/entrega (a linha é criada INATIVA, com taxa 0,
-- para você ajustar a taxa e ativar). Enquanto ela estiver inativa, nada muda no checkout.

CREATE OR REPLACE FUNCTION public.check_delivery_area(_district text, _city text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  z public.delivery_zones%ROWTYPE;
  is_fallback boolean := false;
  served_cities text;
BEGIN
  SELECT * INTO z FROM public.delivery_zones
   WHERE is_active AND lower(district) = lower(trim(_district))
     AND (_city IS NULL OR lower(city) = lower(trim(_city)))
   LIMIT 1;

  IF z.id IS NULL THEN
    SELECT * INTO z FROM public.delivery_zones
     WHERE is_active AND lower(district) = 'demais bairros'
       AND (_city IS NULL OR lower(city) = lower(trim(_city)))
     LIMIT 1;
    is_fallback := (z.id IS NOT NULL);
  END IF;

  IF z.id IS NULL THEN
    IF _city IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.delivery_zones WHERE is_active AND lower(city) = lower(trim(_city))
    ) THEN
      SELECT string_agg(DISTINCT city, ', ') INTO served_cities FROM public.delivery_zones WHERE is_active;
      IF served_cities IS NOT NULL THEN
        RETURN jsonb_build_object('available', false, 'reason', 'Entregamos apenas em ' || served_cities || '.');
      END IF;
    END IF;
    RETURN jsonb_build_object('available', false, 'reason', 'Ainda não entregamos neste bairro.');
  END IF;

  RETURN jsonb_build_object(
    'available', true, 'zone_id', z.id,
    -- na zona "Demais bairros" devolve o bairro que o cliente digitou
    'district', CASE WHEN is_fallback THEN trim(_district) ELSE z.district END,
    'city', z.city,
    'fee', z.fee, 'eta_minutes', z.eta_minutes,
    'min_order_total', z.min_order_total, 'free_from', z.free_from
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.check_delivery_area(text, text) TO anon, authenticated;

-- Zona "Demais bairros" de Pedreira: criada INATIVA para você definir a taxa e ativar em /admin/entrega.
INSERT INTO public.delivery_zones (district, city, state, fee, eta_minutes, is_active)
VALUES ('Demais bairros', 'Pedreira', 'SP', 0, 40, false)
ON CONFLICT (lower(district), lower(city)) DO NOTHING;

-- Desativa as zonas de exemplo de São Paulo que vieram no cadastro inicial (não apaga, só desativa).
UPDATE public.delivery_zones SET is_active = false
WHERE city = 'São Paulo'
  AND district IN ('Centro', 'Jardim América', 'Vila Nova', 'Bela Vista', 'Santa Cecília', 'Pinheiros');

-- Conferência
SELECT district AS bairro, city AS cidade, fee AS taxa, eta_minutes AS minutos, is_active AS ativa
FROM public.delivery_zones
ORDER BY is_active DESC, city, district;
