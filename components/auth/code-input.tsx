"use client";

import * as React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * 6-digit code input: one digit per box, always LTR.
 * - Type: moves to next box; Backspace: clears and moves to previous.
 * - Paste in any box: fills from that box (digits only, max 6).
 */
export function CodeInput({
  value,
  onChange,
  disabled,
  id,
  "aria-label": ariaLabel,
  className,
  containerClassName,
}: CodeInputProps) {
  const normalized = value.replace(/\D/g, "").slice(0, 6);

  const handleChange = React.useCallback(
    (newValue: string) => {
      const digits = newValue.replace(/\D/g, "").slice(0, 6);
      onChange(digits);
    },
    [onChange]
  );

  return (
    <div dir="ltr" className={cn("w-full", className)}>
      <InputOTP
        id={id}
        maxLength={6}
        value={normalized}
        onChange={handleChange}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={ariaLabel}
        containerClassName={cn(
          "flex items-center justify-center gap-1.5 has-[:disabled]:opacity-50",
          containerClassName
        )}
        className="disabled:cursor-not-allowed"
      >
        <InputOTPGroup className="flex items-center gap-1.5 border-0 bg-transparent p-0">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                "h-11 w-11 rounded-lg border border-input bg-background text-center text-base font-semibold tabular-nums transition-all",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "first:rounded-l-lg last:rounded-r-lg"
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
