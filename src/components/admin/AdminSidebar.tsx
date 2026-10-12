import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bike,
  FolderTree,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShoppingBag,
  Tag,
  Ticket,
  UserCog,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { Permission } from "@/features/admin/permissions";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  exact?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view", exact: true },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, permission: "orders.view" },
  { to: "/admin/produtos", label: "Produtos", icon: UtensilsCrossed, permission: "products.view" },
  { to: "/admin/adicionais", label: "Adicionais", icon: PlusCircle, permission: "products.manage" },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree, permission: "categories.manage" },
  { to: "/admin/promocoes", label: "Promoções", icon: Tag, permission: "promotions.manage" },
  { to: "/admin/cupons", label: "Cupons", icon: Ticket, permission: "coupons.manage" },
  { to: "/admin/clientes", label: "Clientes", icon: Users, permission: "customers.view" },
  { to: "/admin/funcionarios", label: "Funcionários", icon: UserCog, permission: "employees.manage" },
  { to: "/admin/entrega", label: "Entrega", icon: Bike, permission: "delivery.manage" },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3, permission: "reports.view" },
  { to: "/admin/config", label: "Configurações", icon: Settings, permission: "settings.manage" },
];

export function AdminNav({
  items,
  onNavigate,
}: {
  items: AdminNavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {items.map(({ to, label, icon: Icon, exact }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact }}
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminSidebarBrand() {
  return (
    <div className="border-b border-sidebar-border px-4 py-4">
      <Logo />
    </div>
  );
}
