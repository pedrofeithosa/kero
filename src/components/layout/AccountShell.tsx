import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { User, ShoppingBag, MapPin } from "lucide-react";
import { PublicShell } from "./PublicShell";

const NAV: Array<{ to: string; label: string; icon: typeof User; exact?: boolean }> = [
  { to: "/conta", label: "Perfil", icon: User, exact: true },
  { to: "/conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { to: "/conta/enderecos", label: "Endereços", icon: MapPin },
];

export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <PublicShell>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              activeProps={{ className: "bg-accent text-foreground" }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </PublicShell>
  );
}
