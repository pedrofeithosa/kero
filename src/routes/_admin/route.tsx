import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthProvider } from "@/features/admin/AdminAuthProvider";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { redirect: "/admin" } });
    const { data: staff } = await supabase.rpc("is_staff", { _user_id: data.user.id });
    if (!staff) throw redirect({ to: "/", search: undefined });
    return { user: data.user };
  },
  component: () => (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  ),
});
