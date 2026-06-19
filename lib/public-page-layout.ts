/** Public marketing pages where the header overlays a full-viewport hero (same as home). */
const PUBLIC_HEADER_OVERLAY_PATHS = [
  "/",
  "/about",
  "/contact",
  "/services",
  "/restaurants",
  "/legal/terms",
  "/legal/privacy",
] as const;

export function isPublicHeaderOverlayPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (PUBLIC_HEADER_OVERLAY_PATHS as readonly string[]).includes(pathname);
}
