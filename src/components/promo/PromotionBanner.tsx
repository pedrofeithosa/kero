import type { ReactNode } from "react";
import { Ticket, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PromotionBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  action?: ReactNode;
  className?: string;
}

/** Kero Mais — Promotion Banner */
export function PromotionBanner({
  eyebrow,
  title,
  description,
  image,
  action,
  className,
}: PromotionBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {image ? (
        <img src={image} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-45" />
      ) : null}
      <span className="absolute inset-0 bg-linear-to-r from-secondary via-secondary/85 to-secondary/30" />
      <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-10">
        <div className="max-w-xl space-y-2">
          {eyebrow ? <Badge variant="promo">{eyebrow}</Badge> : null}
          <h2 className="font-display text-h3 font-extrabold leading-tight md:text-h2">{title}</h2>
          {description ? (
            <p className="text-body text-secondary-foreground/75">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

interface CouponCardProps {
  code: string;
  title: string;
  description?: string;
  expiresAt?: string;
  onCopy?: () => void;
  className?: string;
}

/** Kero Mais — Coupon Card */
export function CouponCard({
  code,
  title,
  description,
  expiresAt,
  onCopy,
  className,
}: CouponCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-card border border-dashed border-primary/40 bg-primary/5 p-4",
        className,
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Ticket className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-h5 font-bold">{title}</p>
        {description ? <p className="text-small text-muted-foreground">{description}</p> : null}
        <p className="mt-1 text-caption font-semibold uppercase tracking-widest text-primary">
          {code}
          {expiresAt ? <span className="ml-2 text-muted-foreground">até {expiresAt}</span> : null}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onCopy} className="shrink-0 gap-2">
        <Copy /> Copiar
      </Button>
    </div>
  );
}
