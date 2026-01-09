import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Teal button - main CTA (matching prototype)
        default: "bg-teal-500 text-white hover:bg-teal-600 shadow-[0_0_20px_rgba(14,165,164,0.3)]",
        // Destructive - red
        destructive: "bg-red-600 text-white hover:bg-red-700",
        // Outline - transparent with border
        outline: "border border-slate-700 bg-transparent text-white hover:bg-slate-800",
        // Secondary - slate background
        secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
        // Ghost - no background until hover
        ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
        // Link style
        link: "text-teal-500 underline-offset-4 hover:underline hover:text-teal-400",
        // Light button - for dark backgrounds
        light: "bg-slate-100 text-slate-900 hover:bg-white",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
