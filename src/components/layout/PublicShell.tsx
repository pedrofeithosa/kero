import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

export function PublicShell({
  children,
  transparentNav = false,
}: {
  children: ReactNode;
  transparentNav?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar transparent={transparentNav} />
      <main className={transparentNav ? "flex-1" : "flex-1 pt-16 md:pt-18"}>{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
