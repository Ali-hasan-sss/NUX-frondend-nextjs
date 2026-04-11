const UUID_REGEX_GLOBAL =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Parses restaurant payment QR payloads (same format as the mobile app).
 * Expected: `PAYMENT::<restaurantUuid>::<optional English name>` or a bare UUID.
 */
export function parsePaymentQrPayload(rawQr: string): {
  restaurantId: string | null;
  restaurantNameEn?: string;
} {
  const trimmed = rawQr.trim();
  const parts = trimmed.split("::");
  if (parts.length >= 3 && parts[0].toUpperCase() === "PAYMENT") {
    const restaurantId = parts[1]?.trim() ?? "";
    const restaurantNameEn = parts.slice(2).join("::").trim();
    if (UUID_REGEX_GLOBAL.test(restaurantId)) {
      return {
        restaurantId,
        restaurantNameEn: restaurantNameEn || undefined,
      };
    }
  }
  return {
    restaurantId: trimmed.match(UUID_REGEX_GLOBAL)?.[0] ?? null,
  };
}

/** Stable row id for client balance list + scan selection (matches mobile ordering). */
export function balanceRowIdFromUserBalance(balance: any): string | undefined {
  const id =
    balance?.targetId ||
    balance?.restaurantId ||
    balance?.restaurant?.id ||
    balance?.id;
  return typeof id === "string" ? id : undefined;
}
