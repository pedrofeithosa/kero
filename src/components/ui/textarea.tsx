import * as React from "react";
import { cn } from "@/lib/utils";
import { inputVariants } from "./input";
import type { VariantProps } from "class-variance-authority";

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    Pick<VariantProps<typeof inputVariants>, "state"> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, ...props }, ref) => (
    <textarea
      className={cn(inputVariants({ state }), "min-h-28 resize-y px-4 py-3", className)}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
