import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  type AppRole,
  type Permission,
  isStaffRole,
  permissionsFor,
} from "@/features/admin/permissions";

interface StaffProfile {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface AdminAuthValue {
  user: User | null;
  roles: AppRole[];
  profile: StaffProfile | null;
  loading: boolean;
  isStaff: boolean;
  can: (permission: Permission) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = React.createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [roles, setRoles] = React.useState<AppRole[]>([]);
  const [profile, setProfile] = React.useState<StaffProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const current = data.user ?? null;
    setUser(current);
    if (!current) {
      setRoles([]);
      setProfile(null);
      setLoading(false);
      return;
    }
    const [{ data: roleRows }, { data: profileRow }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", current.id),
      supabase
        .from("staff_profiles")
        .select("id, name, email, avatar_url, is_active")
        .eq("id", current.id)
        .maybeSingle(),
    ]);
    setRoles(((roleRows ?? []).map((r) => r.role) as AppRole[]) ?? []);
    setProfile((profileRow as StaffProfile | null) ?? null);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void load();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const value = React.useMemo<AdminAuthValue>(() => {
    const granted = permissionsFor(roles);
    const activeProfile = profile?.is_active !== false;
    return {
      user,
      roles,
      profile,
      loading,
      isStaff: activeProfile && roles.some((r) => isStaffRole(r)),
      can: (permission) => activeProfile && granted.has(permission),
      refresh: load,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [user, roles, profile, loading, load]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = React.useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth deve ser usado dentro de AdminAuthProvider");
  return ctx;
}
