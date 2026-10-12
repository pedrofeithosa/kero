import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Kero Mais — Input. Estados: normal, focus, erro, sucesso, disabled. */
const inputVariants = cva(
  "flex w-full rounded-input border bg-background text-body text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 file:border-0 file:bg-transparent file:text-small file:font-medium",
  {
    variants: {
      state: {
        default: "border-input focus-visible:border-primary focus-visible:ring-primary/30",
        error: "border-destructive focus-visible:ring-destructive/30",
        success: "border-success focus-visible:ring-success/30",
      },
      inputSize: {
        sm: "h-10 px-3 text-small",
        default: "h-12 px-4",
        lg: "h-14 px-5",
      },
    },
    defaultVariants: { state: "default", inputSize: "default" },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, inputSize, ...props }, ref) => (
    <input
      type={type}
      className={cn(inputVariants({ state, inputSize }), className)}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input, inputVariants };
