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

/** Clears the fixed compact header (h-16 / sm:h-[4.5rem]) below the `xl` breakpoint. */
export const publicOverlayHeroTopClass =
  "pt-[calc(env(safe-area-inset-top,0px)+6.75rem)] sm:pt-[calc(env(safe-area-inset-top,0px)+7.5rem)] md:pt-[calc(env(safe-area-inset-top,0px)+8rem)]";
