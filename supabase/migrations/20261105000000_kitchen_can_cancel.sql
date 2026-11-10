-- Kero Mais — a cozinha pode cancelar pedidos (com motivo) + o cliente vê o motivo.
--
-- Antes: só administrador/gerente conseguia cancelar. Agora qualquer pessoa da equipe
-- (inclusive a cozinha) cancela, mas:
--   * o motivo é obrigatório;
--   * pedido já finalizado ou já cancelado só pode ser alterado por administrador/gerente
--     (evita "reviver" um pedido cancelado com um toque atrasado em outro aparelho).

CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  _order_id uuid, _status public.order_status, _reason text DEFAULT NULL, _note text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_current public.order_status;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  SELECT status INTO v_current FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado.';
  END IF;

  IF v_current IN ('delivered', 'cancelled') AND NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Este pedido já foi encerrado e não pode ser alterado.';
  END IF;

  IF _status = 'cancelled' AND nullif(trim(coalesce(_reason, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Informe o motivo do cancelamento.';
  END IF;

  UPDATE public.orders
     SET status = _status,
         updated_at = now(),
         cancel_reason = CASE WHEN _status = 'cancelled' THEN trim(_reason) ELSE cancel_reason END,
         cancel_note = CASE WHEN _status = 'cancelled' THEN nullif(trim(coalesce(_note, '')), '') ELSE cancel_note END,
         cancelled_at = CASE WHEN _status = 'cancelled' THEN now() ELSE cancelled_at END
   WHERE id = _order_id;

  INSERT INTO public.order_status_events (order_id, status, note)
  VALUES (_order_id, _status, COALESCE(_reason, _note));

  PERFORM public.log_activity('order.status', 'orders', _order_id::text,
    jsonb_build_object('status', _status, 'reason', _reason));
END;
$$;

-- Acompanhamento do cliente: passa a informar o motivo quando o pedido é cancelado.
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
    'cancel_reason', o.cancel_reason,
    'items', coalesce((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.created_at) FROM public.order_items i WHERE i.order_id = o.id), '[]'::jsonb),
    'events', coalesce((SELECT jsonb_agg(jsonb_build_object('status', e.status, 'created_at', e.created_at) ORDER BY e.created_at) FROM public.order_status_events e WHERE e.order_id = o.id), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END; $$;
GRANT EXECUTE ON FUNCTION public.get_order_by_token(text) TO anon, authenticated;
