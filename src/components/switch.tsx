"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/shadcn/utils";

type SwitchVariant = "default" | "viewMode";

const switchRootVariants = {
  default:
    "data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-input/80",
  viewMode:
    "data-[state=unchecked]:border-emerald-500/40 data-[state=unchecked]:bg-emerald-50 data-[state=checked]:border-cyan-700/40 data-[state=checked]:bg-cyan-100 dark:data-[state=unchecked]:border-emerald-400/60 dark:data-[state=unchecked]:bg-emerald-400/15 dark:data-[state=checked]:border-cyan-400/40 dark:data-[state=checked]:bg-cyan-400/15",
} satisfies Record<SwitchVariant, string>;

const switchThumbVariants = {
  default:
    "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground",
  viewMode:
    "data-[state=unchecked]:bg-emerald-500 data-[state=checked]:bg-cyan-700 dark:data-[state=unchecked]:bg-emerald-400 dark:data-[state=checked]:bg-cyan-400",
} satisfies Record<SwitchVariant, string>;

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  variant?: SwitchVariant;
};

function Switch({
  className,
  variant = "default",
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "cursor-pointer peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        switchRootVariants[variant],
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 translate-x-1 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-5.5",
          switchThumbVariants[variant],
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
