import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        outline: "text-foreground border-border hover:bg-muted",
        teal: "border-transparent bg-teal text-teal-foreground hover:bg-teal/90 shadow-soft",
        orange: "border-transparent bg-orange text-orange-foreground hover:bg-orange/90 shadow-soft",
        purple: "border-transparent bg-purple text-purple-foreground hover:bg-purple/90 shadow-soft",
        pink: "border-transparent bg-pink text-pink-foreground hover:bg-pink/90 shadow-soft",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/90 shadow-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
