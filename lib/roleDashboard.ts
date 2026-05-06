/**
 * “Dashboard” / post-login when the product home for customers is the marketing site (`/`).
 * Matches legacy login + verify-email for USER.
 */
export function getDashboardPathForRole(role: string | undefined): string {
  if (role === "ADMIN" || role === "SUBADMIN") return "/admin";
  if (role === "RESTAURANT_OWNER") return "/dashboard";
  if (role === "COMPANY_OWNER") return "/company";
  return "/";
}

/**
 * Where to send an already-authenticated user away from auth pages (e.g. register).
 * USER goes to the in-app client area.
 */
export function getAuthenticatedAppHome(role: string | undefined): string {
  if (role === "ADMIN" || role === "SUBADMIN") return "/admin";
  if (role === "RESTAURANT_OWNER") return "/dashboard";
  if (role === "COMPANY_OWNER") return "/company";
  if (role === "USER") return "/client/home";
  return "/";
}
