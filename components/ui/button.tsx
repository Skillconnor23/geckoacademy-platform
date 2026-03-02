import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";;
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive rounded-full",
  {
    variants: {
      variant: {
        default:
          "bg-[#7daf41] text-white hover:bg-[#6b9a39] hover:shadow-md",
        primary:
          "bg-[#7daf41] text-white hover:bg-transparent hover:border-[#7daf41] hover:text-[#7daf41]",
        secondary:
          "bg-[#429ead] text-white hover:bg-[#388694] hover:shadow-md",
        highlight:
          "bg-[#ffaa00] text-[#1f2937] hover:bg-[#e09a00] hover:shadow-md",
        destructive:
          "bg-[#b64b29] text-white hover:bg-[#9a3f23] hover:shadow-md",
        outline:
          "bg-muted text-muted-foreground border border-muted hover:bg-muted/80",
        muted:
          "bg-muted text-muted-foreground border-muted hover:bg-muted/80",
        ghost:
          "bg-transparent border border-transparent hover:bg-muted hover:text-foreground",
        link: "text-[#7daf41] underline-offset-4 hover:underline bg-transparent border border-transparent"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
