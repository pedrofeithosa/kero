import type { ReactNode } from "react";
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Store } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_NAV, AdminNav } from "@/components/admin/AdminSidebar";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { ROLE_LABELS, type Permission } from "@/features/admin/permissions";
import { SettingsService } from "@/services/admin/SettingsService";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const STORE_STATE_LABELS: Record<string, string> = {
  auto: "Automático (horário)",
  open: "Loja aberta",
  closed: "Loja fechada",
  paused: "Pedidos pausados",
};

function StoreStatusControl() {
  const { can } = useAdminAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "settings"], queryFn: SettingsService.get });
  const state = data?.store_state ?? "auto";

  async function setState(next: string) {
    try {
      await SettingsService.update({ store_state: next });
      await queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success(`Status atualizado: ${STORE_STATE_LABELS[next]}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível alterar o status.");
    }
  }

  const tone =
    state === "open" ? "bg-success/15 text-success" : state === "auto" ? "bg-muted text-muted-foreground" : "bg-destructive/15 text-destructive";

  if (!can("settings.manage")) {
    return (
      <span className={cn("hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex", tone)}>
        <Store className="h-3.5 w-3.5" />
        {STORE_STATE_LABELS[state]}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn("hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex", tone)}
        >
          <Store className="h-3.5 w-3.5" />
          {STORE_STATE_LABELS[state]}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Status da loja</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(STORE_STATE_LABELS).map(([key, label]) => (
          <DropdownMenuItem key={key} onClick={() => void setState(key)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AdminShellProps {
  children: ReactNode;
  /** Permissão exigida para ver a página. */
  permission?: Permission;
}

export function AdminShell({ children, permission }: AdminShellProps) {
  const { profile, roles, can, signOut, loading } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const items = ADMIN_NAV.filter((item) => can(item.permission));
  const allowed = !permission || can(permission);
  const initials = (profile?.name ?? "K").slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-[256px_1fr]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
          <div className="border-b border-sidebar-border px-4 py-4">
            <Logo />
          </div>
          <AdminNav items={items} />
          <div className="border-t border-sidebar-border p-3">
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
                  <SheetTitle className="sr-only">Menu do painel</SheetTitle>
                  <div className="border-b border-sidebar-border px-4 py-4">
                    <Logo />
                  </div>
                  <AdminNav items={items} onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                Ver site
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <StoreStatusControl />
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex items-center gap-2 rounded-full p-1 hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium md:inline">{profile?.name ?? "Equipe"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">{profile?.name ?? "Equipe"}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {roles.map((r) => ROLE_LABELS[r]).join(", ") || "Sem função"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void handleSignOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            {loading ? (
              <div className="h-40 animate-pulse rounded-2xl bg-muted" />
            ) : allowed ? (
              children
            ) : (
              <EmptyState
                title="Acesso restrito"
                description="Sua função não tem permissão para acessar esta área. Fale com um administrador."
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
