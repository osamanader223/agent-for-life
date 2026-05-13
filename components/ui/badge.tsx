// [Person 2 - UI]
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand text-white",
        secondary: "bg-cream text-brand border border-gold",
        destructive: "bg-red-100 text-red-700",
        outline: "border border-current text-current bg-transparent",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
        gold: "bg-gold/20 text-[#8a6a2a] border border-gold/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
