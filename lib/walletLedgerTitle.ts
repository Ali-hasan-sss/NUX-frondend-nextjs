import type { WalletLedgerEntry } from "@/features/client/wallet/walletTypes";

export type WalletLedgerPerspective = "user" | "restaurant" | "company";

/** Promo credit from limited-time top-up campaigns (ledger source BONUS). */
export function isWalletLedgerPromoBonus(
  type: WalletLedgerEntry["type"],
  source: string,
): boolean {
  const s = (source ?? "").toString().trim().toUpperCase();
  return type === "CREDIT" && s === "BONUS";
}

/** i18n key under wallet.ledgerDesc.* — null → use generic credit/debit + source */
export function walletLedgerTitleKey(
  type: WalletLedgerEntry["type"],
  source: string,
  perspective: WalletLedgerPerspective
): string | null {
  const s = (source ?? "").toString().trim().toUpperCase();

  switch (s) {
    case "ORDER":
      if (perspective === "restaurant" && type === "CREDIT") return "wallet.ledgerDesc.restaurantOrderCredit";
      if (perspective === "user" && type === "DEBIT") return "wallet.ledgerDesc.userOrderDebit";
      if (perspective === "user" && type === "CREDIT") return "wallet.ledgerDesc.userOrderCredit";
      if (perspective === "restaurant" && type === "DEBIT") return "wallet.ledgerDesc.restaurantOrderDebit";
      return null;
    case "STRIPE":
      if (type !== "CREDIT") return null;
      if (perspective === "company") return "wallet.ledgerDesc.topUpCardCompany";
      return perspective === "restaurant"
        ? "wallet.ledgerDesc.topUpCardRestaurant"
        : "wallet.ledgerDesc.topUpCardUser";
    case "COMPANY_ALLOWANCE_PAYOUT":
      if (type === "DEBIT") return "wallet.ledgerDesc.companyAllowancePayout";
      return null;
    case "PAYPAL":
      if (type === "CREDIT") return "wallet.ledgerDesc.topUpPaypal";
      return null;
    case "WITHDRAWAL":
      if (type === "DEBIT") return "wallet.ledgerDesc.withdrawalDebit";
      return null;
    case "ADMIN":
      if (type === "CREDIT") return "wallet.ledgerDesc.adminCredit";
      if (type === "DEBIT") return "wallet.ledgerDesc.adminDebit";
      return null;
    case "BONUS":
      if (type === "CREDIT") return "wallet.ledgerDesc.promoTopUpGift";
      return null;
    default:
      return null;
  }
}
