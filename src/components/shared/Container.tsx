import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Kero Mais — Container oficial: 1280px, gutters 16/24/32 */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn("container-page", className)}>{children}</Tag>;
}
