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

export type AdminUserWalletDetail = {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    isRestaurant: boolean;
  };
  wallet: {
    currency: string;
    availableBalance: string;
    ledgerCompletedBalance: string;
    pendingWithdrawalHold: string;
  };
  minSelfServiceWithdrawalEur: string;
};

export type AdminWalletSelectUserItem = {
  id: string;
  email: string;
  fullName: string | null;
};

export type AdminWalletSelectRestaurantItem = {
  id: string;
  name: string;
  ownerEmail: string;
};

export type AdminRestaurantWalletDetail = {
  restaurant: {
    id: string;
    name: string;
    isActive: boolean;
    currency: string | null;
    owner: { id: string; email: string; fullName: string | null };
  };
  wallet: {
    currency: string;
    availableBalance: string;
    ledgerCompletedBalance: string;
    pendingWithdrawalHold: string;
  };
  minSelfServiceWithdrawalEur: string;
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

  async getUserWalletDetail(userId: string): Promise<AdminUserWalletDetail> {
    const res = await axiosInstance.get(`/admin/wallet/user/${userId}/balance-detail`);
    return unwrap<AdminUserWalletDetail>(res);
  },

  async getRestaurantWalletDetail(restaurantId: string): Promise<AdminRestaurantWalletDetail> {
    const res = await axiosInstance.get(
      `/admin/wallet/restaurant/${restaurantId}/balance-detail`,
    );
    return unwrap<AdminRestaurantWalletDetail>(res);
  },

  async listWalletSelectUsers(params?: {
    search?: string;
    take?: number;
  }): Promise<{ items: AdminWalletSelectUserItem[] }> {
    const res = await axiosInstance.get("/admin/wallet/select-options/users", {
      params: {
        ...(params?.search != null && params.search !== "" ? { search: params.search } : {}),
        ...(params?.take != null ? { take: params.take } : {}),
      },
    });
    return unwrap<{ items: AdminWalletSelectUserItem[] }>(res);
  },

  async listWalletSelectRestaurants(params?: {
    search?: string;
    take?: number;
  }): Promise<{ items: AdminWalletSelectRestaurantItem[] }> {
    const res = await axiosInstance.get("/admin/wallet/select-options/restaurants", {
      params: {
        ...(params?.search != null && params.search !== "" ? { search: params.search } : {}),
        ...(params?.take != null ? { take: params.take } : {}),
      },
    });
    return unwrap<{ items: AdminWalletSelectRestaurantItem[] }>(res);
  },

  async manualWalletDebit(payload: {
    ownerType: "USER" | "RESTAURANT";
    ownerId: string;
    amount: number;
    currency?: string;
    note?: string;
    idempotencyKey?: string;
  }): Promise<{ availableBalanceAfter: string; currency: string }> {
    const res = await axiosInstance.post("/admin/wallet/manual-debit", payload);
    return unwrap<{ availableBalanceAfter: string; currency: string }>(res);
  },
};
