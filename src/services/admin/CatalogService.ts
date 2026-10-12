import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CategoryRow = Tables<"categories">;
export type ProductRow = Tables<"products">;
export type OptionGroupRow = Tables<"product_option_groups">;
export type OptionRow = Tables<"product_options">;

async function log(action: string, resource: string, id?: string, details?: Record<string, unknown>) {
  await supabase.rpc("log_activity", {
    _action: action,
    _resource: resource,
    _resource_id: id,
    _details: (details ?? {}) as never,
  });
}

export const CatalogService = {
  /* ---------------- categorias ---------------- */
  async listCategories(includeInactive = true): Promise<CategoryRow[]> {
    let query = supabase.from("categories").select("*").is("archived_at", null).order("position");
    if (!includeInactive) query = query.eq("is_active", true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async createCategory(input: TablesInsert<"categories">) {
    const { data, error } = await supabase.from("categories").insert(input).select().single();
    if (error) throw new Error(error.message);
    await log("categoria.criada", "categories", data.id, { nome: data.name });
    return data;
  },

  async updateCategory(id: string, input: TablesUpdate<"categories">) {
    const { data, error } = await supabase
      .from("categories")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await log("categoria.atualizada", "categories", id, input as Record<string, unknown>);
    return data;
  },

  async archiveCategory(id: string) {
    const { error } = await supabase
      .from("categories")
      .update({ archived_at: new Date().toISOString(), is_active: false })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await log("categoria.arquivada", "categories", id);
  },

  async reorderCategories(ids: string[]) {
    await Promise.all(
      ids.map((id, index) => supabase.from("categories").update({ position: index + 1 }).eq("id", id)),
    );
    await log("categoria.reordenada", "categories");
  },

  /* ---------------- produtos ---------------- */
  async listProducts(params?: { search?: string; categoryId?: string; onlyActive?: boolean }) {
    let query = supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .is("archived_at", null)
      .order("position");
    if (params?.search) query = query.ilike("name", `%${params.search}%`);
    if (params?.categoryId) query = query.eq("category_id", params.categoryId);
    if (params?.onlyActive) query = query.eq("is_active", true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<ProductRow & { categories: { id: string; name: string; slug: string } | null }>;
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_option_groups(*, product_options(*))")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data as ProductRow & {
      product_option_groups: Array<OptionGroupRow & { product_options: OptionRow[] }>;
    };
  },

  async createProduct(input: TablesInsert<"products">) {
    const { data, error } = await supabase.from("products").insert(input).select().single();
    if (error) throw new Error(error.message);
    await log("produto.criado", "products", data.id, { nome: data.name, preco: data.price });
    return data;
  },

  async updateProduct(id: string, input: TablesUpdate<"products">) {
    const { data, error } = await supabase
      .from("products")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await log("produto.atualizado", "products", id, input as Record<string, unknown>);
    return data;
  },

  /** Nunca exclui: produtos com histórico de vendas são arquivados (soft delete). */
  async archiveProduct(id: string) {
    const { error } = await supabase
      .from("products")
      .update({ archived_at: new Date().toISOString(), is_active: false })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await log("produto.arquivado", "products", id);
  },

  /* ---------------- adicionais compartilhados ---------------- */
  /** Grupos que valem para vários produtos (ver migração shared_option_groups). */
  async listSharedGroups() {
    const { data, error } = await supabase
      .from("product_option_groups")
      .select("*, product_options(*)")
      .eq("is_shared", true)
      .order("position");
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<OptionGroupRow & { product_options: OptionRow[] }>;
  },

  async createSharedGroup(position: number) {
    return CatalogService.createGroup({
      name: "Adicionais",
      type: "multiple",
      is_shared: true,
      product_id: null,
      category_ids: [],
      position,
      min_select: 0,
    });
  },

  /* ---------------- adicionais ---------------- */
  async createGroup(input: TablesInsert<"product_option_groups">) {
    const { data, error } = await supabase.from("product_option_groups").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async updateGroup(id: string, input: TablesUpdate<"product_option_groups">) {
    const { error } = await supabase.from("product_option_groups").update(input).eq("id", id);
    if (error) throw new Error(error.message);
  },
  async deleteGroup(id: string) {
    const { error } = await supabase.from("product_option_groups").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
  async createOption(input: TablesInsert<"product_options">) {
    const { data, error } = await supabase.from("product_options").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async updateOption(id: string, input: TablesUpdate<"product_options">) {
    const { error } = await supabase.from("product_options").update(input).eq("id", id);
    if (error) throw new Error(error.message);
  },
  async deleteOption(id: string) {
    const { error } = await supabase.from("product_options").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export { log as logActivity };
