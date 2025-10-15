"use client";

import { LabeledSelect } from "./LabeledSelect";

export function PageSizeSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <LabeledSelect
      label="count"
      value={String(value)}
      as
      any
      onChange={(v: string) => onChange(Number(v)) as any}
      options={[
        { label: "10", value: "10" },
        { label: "25", value: "25" },
        { label: "50", value: "50" },
      ]}
    />
  );
}
