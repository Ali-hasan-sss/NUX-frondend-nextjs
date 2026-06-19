export type PlanPermissionType =
  | "MANAGE_MENU"
  | "MANAGE_QR_CODES"
  | "MANAGE_GROUPS"
  | "MANAGE_ADS"
  | "MANAGE_PACKAGES"
  | "MANAGE_ORDERS";

export interface RestaurantPlanPermission {
  type: PlanPermissionType | string;
  value: number | null;
  isUnlimited: boolean;
}

export function hasRestaurantPermission(
  permissions: RestaurantPlanPermission[] | undefined | null,
  type: PlanPermissionType
): boolean {
  if (!permissions?.length) return false;
  return permissions.some((p) => String(p.type) === type);
}

/** Dashboard routes that require a specific plan permission. */
export const DASHBOARD_ROUTE_PERMISSIONS: Record<string, PlanPermissionType> = {
  "/dashboard/orders": "MANAGE_ORDERS",
  "/dashboard/menu": "MANAGE_MENU",
  // /dashboard/qr-codes: always accessible — sections inside are gated individually
  "/dashboard/table-codes": "MANAGE_QR_CODES",
  "/dashboard/qr-scans": "MANAGE_QR_CODES",
  "/dashboard/floor-plan": "MANAGE_QR_CODES",
  "/dashboard/ads": "MANAGE_ADS",
  "/dashboard/packages": "MANAGE_PACKAGES",
  "/dashboard/groups": "MANAGE_GROUPS",
};

export function canAccessDashboardRoute(
  href: string,
  permissions: RestaurantPlanPermission[] | undefined | null
): boolean {
  const required = DASHBOARD_ROUTE_PERMISSIONS[href];
  if (!required) return true;
  return hasRestaurantPermission(permissions, required);
}

export function canShowLoyaltyQrCodes(
  permissions: RestaurantPlanPermission[] | undefined | null
): boolean {
  return hasRestaurantPermission(permissions, "MANAGE_QR_CODES");
}

export function canShowMenuQrCode(
  permissions: RestaurantPlanPermission[] | undefined | null
): boolean {
  return hasRestaurantPermission(permissions, "MANAGE_MENU");
}
