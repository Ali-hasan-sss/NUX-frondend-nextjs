"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { useContext } from "react";

import { cn } from "@/lib/utils";
import { LanguageContext } from "@/hooks/use-language";

type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> & {
  dir?: "ltr" | "rtl";
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, dir: dirProp, ...props }, ref) => {
  const languageContext = useContext(LanguageContext);
  // Prefer document dir so dashboard (i18next) and admin (LanguageContext) stay in sync
  const docDir =
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("dir") as
          | "ltr"
          | "rtl"
          | null) || "ltr"
      : "ltr";
  const resolvedDir = dirProp ?? docDir ?? languageContext?.direction ?? "ltr";
  const isRTL = resolvedDir === "rtl";

  return (
    <SwitchPrimitives.Root
      dir={resolvedDir}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          isRTL
            ? "data-[state=unchecked]:translate-x-0 data-[state=checked]:-translate-x-5"
            : "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5"
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
