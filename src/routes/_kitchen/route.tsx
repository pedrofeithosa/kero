import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/** Cozinha: só entra quem está logado e é da equipe (cozinha, atendente, gerente ou admin). */
export const Route = createFileRoute("/_kitchen")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { redirect: "/kds" } });
    const { data: staff } = await supabase.rpc("is_staff", { _user_id: data.user.id });
    if (!staff) throw redirect({ to: "/", search: undefined });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
