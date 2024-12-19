import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 max-w-max max-h-max",
    {
        variants: {
            size: {
                sm: "px-2 py-0.5 text-xs", // Small size
                md: "px-3 py-1 text-sm", // Medium size (default)
                lg: "px-4 py-1.5 text-base", // Large size
            },
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
            },
        },
        defaultVariants: {
            size: "md", // Default size
            variant: "default", // Default variant
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, size, variant, ...props }: BadgeProps) {
    return (
        <div
            className={cn(badgeVariants({ size, variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
