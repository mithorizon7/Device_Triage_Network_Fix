import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Whitespace-nowrap: Badges should never wrap.
  "whitespace-nowrap inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" +
    " hover-elevate ",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/90 text-primary-foreground shadow-xs",
        secondary: "border-transparent bg-secondary/70 text-secondary-foreground",
        destructive: "border-transparent bg-destructive/90 text-destructive-foreground shadow-xs",

        outline: "border [border-color:var(--badge-outline)] shadow-xs text-foreground/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
