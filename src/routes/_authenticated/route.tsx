import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout placeholder. Quando o Lovable Cloud for ativado, será substituído
// pelo gate gerenciado (ssr:false + beforeLoad supabase.auth.getUser).
export const Route = createFileRoute("/_authenticated")({
  component: () => <Outlet />,
});
