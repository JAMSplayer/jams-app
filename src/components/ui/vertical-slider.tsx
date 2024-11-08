import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils"; // Assuming `cn` is a utility for classnames

const VerticalSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, onValueChange, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        value={value}
        onValueChange={onValueChange}
        className={cn(
            "relative flex touch-none select-none items-center",
            className
        )}
        {...props}
    >
        {/* Vertical Track */}
        <SliderPrimitive.Track className="relative w-1.5 h-full grow overflow-hidden rounded-full bg-primary/20">
            {/* Range inside the Track */}
            <SliderPrimitive.Range className="absolute w-full bg-primary" />
        </SliderPrimitive.Track>
        {/* Thumb */}
        <SliderPrimitive.Thumb className="block w-4 h-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 -ml-1" />
    </SliderPrimitive.Root>
));

VerticalSlider.displayName = SliderPrimitive.Root.displayName;

export { VerticalSlider };
