import type { TFunction } from "i18next";
import type { NotificationItem } from "@/features/notifications/notificationsTypes";

type TranslatedNotification = {
  title: string;
  body: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeLower(value: unknown): string {
  return normalize(value).toLowerCase();
}

function translateTitle(title: string, t: TFunction): string {
  const key = normalizeLower(title);

  if (key === "voucher sent") {
    return t("dashboard.notifications.translatedTitles.voucherSent");
  }
  if (key === "voucher received") {
    return t("dashboard.notifications.translatedTitles.voucherReceived");
  }
  if (key === "payment successful") {
    return t("dashboard.notifications.translatedTitles.paymentSuccessful");
  }
  if (key === "new payment received") {
    return t("dashboard.notifications.translatedTitles.newPaymentReceived");
  }
  if (key === "new wallet payment received") {
    return t("dashboard.notifications.translatedTitles.newWalletPaymentReceived");
  }
  if (key === "new group payment") {
    return t("dashboard.notifications.translatedTitles.newGroupPayment");
  }
  if (key === "you received a stars!") {
    return t("dashboard.notifications.translatedTitles.starsReceived");
  }
  if (key === "payment reminder") {
    return t("dashboard.notifications.translatedTitles.paymentReminder");
  }
  if (key === "subscription renewal reminder (30 days)") {
    return t("dashboard.notifications.translatedTitles.subscriptionRenewalReminder30");
  }
  if (key === "system maintenance") {
    return t("dashboard.notifications.translatedTitles.systemMaintenance");
  }
  if (key === "group invitation accepted") {
    return t("dashboard.notifications.translatedTitles.groupInvitationAccepted");
  }
  if (key === "new group invitation") {
    return t("dashboard.notifications.translatedTitles.newGroupInvitation");
  }
  if (key === "new qr code scan") {
    return t("dashboard.notifications.translatedTitles.newQrScan");
  }

  return title;
}

function translateBody(body: string, t: TFunction): string {
  const raw = normalize(body);
  const rawNoDot = raw.replace(/[.]+$/, "").trim();
  if (!raw) return raw;

  let m = rawNoDot.match(/^You sent ([\d.]+)\s*EUR to (.+)$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.voucherSent", {
      amount: m[1],
      recipient: m[2],
    });
  }

  m = rawNoDot.match(/^You received ([\d.]+)\s*EUR from (.+)$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.voucherReceived", {
      amount: m[1],
      sender: m[2],
    });
  }

  m = rawNoDot.match(/^You spent ([\d.]+)\s*([a-z_]+)\s+at\s+(.+)$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.userPaymentAtRestaurant", {
      amount: m[1],
      currency: m[2],
      restaurant: m[3],
    });
  }

  m = rawNoDot.match(/^A user paid ([\d.]+)\s*([a-z_]+)\s+at your restaurant$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.restaurantPaymentReceived", {
      amount: m[1],
      currency: m[2],
    });
  }

  m = rawNoDot.match(/^A user paid ([\d.]+)\s*([a-z_]+)\s+across your group (.+)$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.groupPaymentReceived", {
      amount: m[1],
      currency: m[2],
      group: m[3],
    });
  }

  m = rawNoDot.match(/^You received (\d+)\s*stars meal\s*&\s*(\d+)\s*stars drink from (.+)$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.starsReceived", {
      meal: m[1],
      drink: m[2],
      restaurant: m[3],
    });
  }

  m = rawNoDot.match(/^Customer (.+) scanned QR code - (meal|drink) scan$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.customerScannedQr", {
      customer: m[1],
      kind: m[2],
    });
  }

  m = rawNoDot.match(/^Received ([\d.]+)\s*EUR from (.+)$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.receivedFromUser", {
      amount: m[1],
      sender: m[2],
    });
  }

  m = rawNoDot.match(/^Your subscription will end in (\d+) days\.?\s*Please renew to continue using all features\.?$/i);
  if (m) {
    return t("dashboard.notifications.translatedBodies.subscriptionWillEndInDays", {
      days: m[1],
    });
  }

  return raw;
}

export function translateNotificationItem(
  notification: Pick<NotificationItem, "title" | "body">,
  t: TFunction
): TranslatedNotification {
  const title = normalize(notification.title);
  const body = normalize(notification.body);

  return {
    title: translateTitle(title, t),
    body: translateBody(body, t),
  };
}
