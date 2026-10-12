-- Kero Mais — o botão "loja aberta / fechada / pausada" do painel (store_settings.store_state)
-- passa a valer de verdade. Antes ele só era gravado e os pedidos seguiam o horário fixo.
--   auto   = segue os horários cadastrados
--   open   = aberta, ignora o horário
--   closed = fechada
--   paused = pedidos pausados (mostra paused_message)

ALTER FUNCTION public.store_status(timestamptz) RENAME TO store_status_by_hours;

CREATE OR REPLACE FUNCTION public.store_status(_at timestamptz DEFAULT now())
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.store_settings%ROWTYPE;
BEGIN
  SELECT * INTO s FROM public.store_settings LIMIT 1;
  IF FOUND THEN
    IF s.store_state = 'closed' THEN
      RETURN jsonb_build_object('open', false, 'reason', 'Estamos fechados no momento.');
    ELSIF s.store_state = 'paused' THEN
      RETURN jsonb_build_object('open', false,
        'reason', coalesce(nullif(s.paused_message,''), 'Pedidos pausados por alguns minutos. Já já voltamos!'));
    ELSIF s.store_state = 'open' THEN
      RETURN jsonb_build_object('open', true);
    END IF;
  END IF;
  RETURN public.store_status_by_hours(_at);
END; $$;
GRANT EXECUTE ON FUNCTION public.store_status(timestamptz) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.store_status_by_hours(timestamptz) FROM anon, authenticated, PUBLIC;
