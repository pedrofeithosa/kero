import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display font-black tracking-tight text-xl",
        variant === "light" ? "text-primary-foreground" : "text-foreground",
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-brand">
        <Flame className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span>
        Kero <span className="text-primary">Mais</span>
      </span>
    </span>
  );
}
