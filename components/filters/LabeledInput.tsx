"use client";

import { Input } from "@/components/ui/input";

export function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex-1 flex-col items-start gap-2">
      <span className="text-xs md:text-sm  font-medium text-gray-700 mb-1">
        {label}
      </span>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
