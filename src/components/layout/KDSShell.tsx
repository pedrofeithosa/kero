import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

/** Casca da cozinha: cabeçalho compacto, pensado para celular em pé. */
export function KDSShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b bg-secondary px-3 text-secondary-foreground">
        <Logo variant="light" />
        <div className="flex items-center gap-2">{right}</div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-3 pb-24">{children}</main>
    </div>
  );
}
