
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/images/logo-kero-mais.jpeg"
      alt="Kero Mais — Lanches e Delivery"
      className={cn("h-12 w-auto object-contain", className)}
    />
  );
}
