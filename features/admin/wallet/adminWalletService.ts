import { axiosInstance } from "@/utils/axiosInstance";

export type AdminWalletOverviewCurrency = {
  currency: string;
  walletCount: number;
  restaurantWalletCount: number;
  totalBalance: string;
  totalCredits: string;
  totalDebits: string;
  otherDebitsFromLedgerSum: string;
  netFromLedger: string;
  ledgerReconciliationDelta: string;
  ledgerReconciliationOk: boolean;
  completedUserWithdrawalsSum: string;
  userWithdrawalDebitsFromLedgerSum: string;
  withdrawalReconciliationDelta: string;
  withdrawalReconciliationOk: boolean;
  pendingUserWithdrawalsTotal: string;
  completedRestaurantWithdrawalsSum: string;
  restaurantWithdrawalDebitsFromLedgerSum: string;
  restaurantWithdrawalReconciliationDelta: string;
  restaurantWithdrawalReconciliationOk: boolean;
  pendingRestaurantWithdrawalsTotal: string;
  restaurantTotalBalance: string;
  restaurantTotalCredits: string;
  restaurantTotalDebits: string;
  restaurantOtherDebitsFromLedgerSum: string;
  restaurantNetFromLedger: string;
  restaurantLedgerReconciliationDelta: string;
  restaurantLedgerReconciliationOk: boolean;
};

export type AdminWalletOverview = {
  byCurrency: AdminWalletOverviewCurrency[];
};

export type AdminWalletWithdrawalRow = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  accountInfo: Record<string, unknown> | null;
  user: { id: string; email: string; fullName: string | null } | null;
  restaurant: {
    id: string;
    name: string;
    owner: { id: string; email: string; fullName: string | null };
  } | null;
};

export type AdminWalletWithdrawalListParams = {
  status?: "ALL" | "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";
  skip?: number;
  take?: number;
};

function unwrap<T>(res: { data: { data?: T; success?: boolean; message?: string } }): T {
  const d = res.data?.data;
  if (d === undefined) {
    throw new Error(res.data?.message || "Invalid response");
  }
  return d as T;
}

export const adminWalletService = {
  async getOverview(): Promise<AdminWalletOverview> {
    const res = await axiosInstance.get("/admin/wallet/overview");
    return unwrap<AdminWalletOverview>(res);
  },

  async listWithdrawals(
    params: AdminWalletWithdrawalListParams = {},
  ): Promise<{ items: AdminWalletWithdrawalRow[]; total: number }> {
    const res = await axiosInstance.get("/admin/wallet/withdrawals", {
      params: {
        status: params.status ?? "ALL",
        skip: params.skip ?? 0,
        take: params.take ?? 50,
      },
    });
    return unwrap<{ items: AdminWalletWithdrawalRow[]; total: number }>(res);
  },

  async approveWithdrawal(id: string): Promise<void> {
    await axiosInstance.post(`/admin/wallet/withdrawals/${id}/approve`);
  },

  async rejectWithdrawal(id: string, reason: string): Promise<void> {
    await axiosInstance.post(`/admin/wallet/withdrawals/${id}/reject`, {
      reason: reason.trim(),
    });
  },
};
