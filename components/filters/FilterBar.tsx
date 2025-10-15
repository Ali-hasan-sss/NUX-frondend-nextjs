"use client";

import type React from "react";

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col  gap-4">{children}</div>;
}
