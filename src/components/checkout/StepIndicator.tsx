import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECKOUT_STEPS, useCheckout, type CheckoutStepIndex } from "@/features/checkout/CheckoutProvider";

/** Kero Mais — Indicador de progresso do checkout */
export function StepIndicator() {
  const { step, goTo, maxStepReached } = useCheckout();

  return (
    <nav aria-label="Progresso do checkout">
      <ol className="flex items-center gap-1 sm:gap-2">
        {CHECKOUT_STEPS.map((label, index) => {
          const state = index < step ? "done" : index === step ? "current" : "todo";
          const reachable = index <= maxStepReached;
          return (
            <li key={label} className="flex flex-1 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && goTo(index as CheckoutStepIndex)}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 rounded-button px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  reachable ? "cursor-pointer" : "cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border-2 text-caption font-bold",
                    state === "done" && "border-success bg-success text-success-foreground",
                    state === "current" && "border-primary bg-primary text-primary-foreground",
                    state === "todo" && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {state === "done" ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden truncate font-display text-small font-bold sm:block",
                    state === "todo" ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
              {index < CHECKOUT_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn("h-0.5 w-4 shrink-0 rounded-full sm:w-6", index < step ? "bg-success" : "bg-border")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
