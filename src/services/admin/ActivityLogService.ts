import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ActivityLog = Tables<"activity_logs">;

export const ActivityLogService = {
  async list(limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};

export const ACTION_LABELS: Record<string, string> = {
  "produto.criado": "criou o produto",
  "produto.atualizado": "atualizou o produto",
  "produto.arquivado": "arquivou o produto",
  "categoria.criada": "criou a categoria",
  "categoria.atualizada": "atualizou a categoria",
  "categoria.arquivada": "arquivou a categoria",
  "categoria.reordenada": "reordenou as categorias",
  "promocao.criada": "criou a promoção",
  "promocao.atualizada": "atualizou a promoção",
  "promocao.desativada": "desativou a promoção",
  "cupom.criado": "criou o cupom",
  "cupom.atualizado": "atualizou o cupom",
  "funcionario.atualizado": "atualizou o funcionário",
  "funcionario.funcao": "alterou a função de um funcionário",
  "config.atualizada": "alterou as configurações da loja",
  "horario.atualizado": "alterou o horário de funcionamento",
  "zona.criada": "criou uma zona de entrega",
  "zona.atualizada": "alterou uma zona de entrega",
  "order.status": "alterou o status de um pedido",
};
