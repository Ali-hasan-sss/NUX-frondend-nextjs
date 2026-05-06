import { axiosInstance } from "@/utils/axiosInstance";
import type {
  WalletBalanceData,
  WalletLedgerEntry,
  WithdrawalPayload,
  WalletWithdrawalRequestRow,
} from "@/features/client/wallet/walletTypes";

function base(companyId: string) {
  return `/client/company/${companyId}/wallet`;
}

function unwrapData<T>(res: { data: { success?: boolean; data?: T; message?: string } }): T {
  const body = res.data;
  if (body?.data !== undefined) return body.data as T;
  return body as unknown as T;
}

export function companyWalletService(companyId: string) {
  const b = base(companyId);
  return {
    getBalance: async (): Promise<WalletBalanceData> => {
      const res = await axiosInstance.get(`${b}/balance`);
      return unwrapData<WalletBalanceData>(res);
    },

    getTransactions: async (take = 20, cursor?: string): Promise<WalletLedgerEntry[]> => {
      const res = await axiosInstance.get(`${b}/ledger`, {
        params: { take, ...(cursor ? { cursor } : {}) },
      });
      return unwrapData<WalletLedgerEntry[]>(res);
    },

    createTopUpPaymentIntent: async (
      amountEur: number
    ): Promise<{ clientSecret: string | null; paymentIntentId: string }> => {
      const res = await axiosInstance.post(`${b}/top-up/payment-intent`, { amountEur });
      return unwrapData<{ clientSecret: string | null; paymentIntentId: string }>(res);
    },

    syncTopUpAfterPayment: async (
      paymentIntentId: string
    ): Promise<{ applied: boolean; duplicate?: boolean }> => {
      const res = await axiosInstance.post(`${b}/top-up/sync`, { paymentIntentId });
      return unwrapData<{ applied: boolean; duplicate?: boolean }>(res);
    },

    requestWithdrawal: async (payload: WithdrawalPayload): Promise<{ id: string }> => {
      const res = await axiosInstance.post(`${b}/withdrawals`, payload);
      return unwrapData<{ id: string }>(res);
    },

    listWithdrawalRequests: async (params?: {
      take?: number;
      skip?: number;
    }): Promise<{ items: WalletWithdrawalRequestRow[]; total: number }> => {
      const res = await axiosInstance.get(`${b}/withdrawals`, {
        params: { take: params?.take ?? 50, skip: params?.skip ?? 0 },
      });
      return unwrapData<{ items: WalletWithdrawalRequestRow[]; total: number }>(res);
    },

    cancelWithdrawalRequest: async (withdrawalId: string): Promise<void> => {
      await axiosInstance.post(`${b}/withdrawals/${withdrawalId}/cancel`);
    },
  };
}
