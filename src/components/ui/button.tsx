import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Kero Mais — Button
 * Variantes: primary | secondary | outline | ghost | danger | success | highlight | whatsapp | link
 * Estados: default, hover, active, focus-visible, disabled, loading.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-display font-bold cursor-pointer select-none transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-brand hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90",
        outline:
          "border-2 border-border bg-background text-foreground hover:border-primary hover:text-primary",
        ghost: "text-foreground hover:bg-muted",
        danger: "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        success: "bg-success text-success-foreground shadow-soft hover:bg-success/90",
        highlight: "bg-highlight text-highlight-foreground shadow-soft hover:bg-highlight/90",
        whatsapp: "bg-whatsapp text-whatsapp-foreground shadow-float hover:bg-whatsapp/90",
        link: "text-primary underline-offset-4 hover:underline",
        /* aliases shadcn (compatibilidade) */
        default: "bg-primary text-primary-foreground shadow-brand hover:bg-primary-hover",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-small [&_svg]:size-4",
        default: "h-11 px-5 text-small [&_svg]:size-5",
        lg: "h-13 px-7 text-body [&_svg]:size-5",
        xl: "h-14 px-8 text-h5 [&_svg]:size-6",
        icon: "h-11 w-11 [&_svg]:size-5",
        "icon-sm": "h-9 w-9 [&_svg]:size-4",
      },
      full: { true: "w-full" },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    if (asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size, full, className }))} ref={ref} {...props}>
          {children}
        </Comp>
      );
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, full, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
