const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SCAN_PATH_RE =
  /^\/scan\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;

/** Public URL encoded in printed meal/drink QR codes (opens in the phone camera). */
export function loyaltyScanUrl(origin: string, qrCodeUuid: string): string {
  const base = (origin || "https://nuxapp.de").replace(/\/$/, "");
  return `${base}/scan/${qrCodeUuid}`;
}

/** Extract the meal/drink UUID from a raw UUID or https://nuxapp.de/scan/{uuid}. */
export function extractLoyaltyQrCode(raw: string): string {
  const s = raw.trim();
  if (!s) return s;

  try {
    const withProto = /^https?:\/\//i.test(s)
      ? s
      : `https://nuxapp.de${s.startsWith("/") ? s : `/${s}`}`;
    const url = new URL(withProto);
    const m = url.pathname.match(SCAN_PATH_RE);
    if (m) return m[1];
  } catch {
    // ignore
  }

  if (UUID_RE.test(s)) return s;
  return s;
}

export function isLoyaltyScanPath(pathname: string): boolean {
  return SCAN_PATH_RE.test(pathname);
}

export function isValidLoyaltyQrCode(code: string): boolean {
  return UUID_RE.test(code.trim());
}
