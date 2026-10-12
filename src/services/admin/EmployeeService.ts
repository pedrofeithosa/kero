import { supabase } from "@/integrations/supabase/client";
import type { StaffRole } from "@/features/admin/permissions";
import { logActivity } from "./CatalogService";

export interface EmployeeRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  roles: StaffRole[];
}

export const EmployeeService = {
  async list(): Promise<EmployeeRow[]> {
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      supabase
        .from("staff_profiles")
        .select("id, name, email, phone, is_active, last_seen_at, created_at")
        .order("created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (error) throw new Error(error.message);
    return (profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? [])
        .filter((r) => r.user_id === p.id)
        .map((r) => r.role as StaffRole)
        .filter((r) => r !== ("customer" as unknown as StaffRole)),
    }));
  },

  async update(id: string, input: { name?: string; phone?: string | null; is_active?: boolean }) {
    const { error } = await supabase
      .from("staff_profiles")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity("funcionario.atualizado", "staff_profiles", id, input);
  },

  async setRole(userId: string, role: StaffRole) {
    const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delError) throw new Error(delError.message);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) throw new Error(error.message);
    await logActivity("funcionario.funcao", "user_roles", userId, { funcao: role });
  },

  async touchLastSeen(id: string) {
    await supabase.from("staff_profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", id);
  },
};
