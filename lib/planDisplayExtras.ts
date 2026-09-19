/** Display-only extras. Technical access still uses the parent permission. */
export const PLAN_DISPLAY_EXTRAS: Record<string, string[]> = {
  MANAGE_QR_CODES: ["TABLE_FLOOR_PLAN"],
};

export const ORDER_FEATURE_EXTRAS = [
  "staffApprovedOrdering",
  "kitchenDisplay",
  "orderReceiptConfirm",
  "orderStatusFlow",
  "floorStaffLiveTracking",
  "callWaiter",
  "useWithoutDownload",
  "restaurantVisibility",
] as const;

export type OrderFeatureExtra = (typeof ORDER_FEATURE_EXTRAS)[number];

export function extraDisplayPermissionsFor(type: string): string[] {
  return PLAN_DISPLAY_EXTRAS[type] ?? [];
}

export function isGastroProPlan(title: string | null | undefined): boolean {
  return /gastro\s*pro/i.test(String(title || ""));
}

export function isStarterPlusPlan(title: string | null | undefined): boolean {
  return /starter\s*plus/i.test(String(title || ""));
}

/** Homepage service cards. Display-only; technical access uses these existing permissions. */
export const HOMEPAGE_SERVICE_CARDS = [
  { key: "secureOrdering", permission: "MANAGE_ORDERS" },
  { key: "kitchenDisplay", permission: "MANAGE_ORDERS" },
  { key: "liveTracking", permission: "MANAGE_ORDERS" },
  { key: "floorTable", permission: "MANAGE_QR_CODES" },
  { key: "callWaiter", permission: "MANAGE_ORDERS" },
  { key: "loyaltyVisibility", permission: "CUSTOMER_LOYALTY" },
] as const;

export type HomepageServiceCardKey =
  (typeof HOMEPAGE_SERVICE_CARDS)[number]["key"];

export function shouldShowOrderFeatureExtras(plan: {
  title?: string | null;
  permissions?: Array<{ type: string }> | null;
}): boolean {
  if (isGastroProPlan(plan.title)) return true;
  return (plan.permissions || []).some((p) => p.type === "MANAGE_ORDERS");
}
