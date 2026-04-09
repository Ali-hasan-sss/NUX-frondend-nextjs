import { axiosInstance } from "@/utils/axiosInstance";
import type { WalletBalanceData, WalletLedgerEntry, WithdrawalPayload } from "@/features/client/wallet/walletTypes";

const BASE = "/restaurants/account/wallet";

function unwrapData<T>(res: { data: { success?: boolean; data?: T; message?: string } }): T {
  const body = res.data;
  if (body?.data !== undefined) return body.data as T;
  return body as unknown as T;
}

export const restaurantWalletService = {
  getBalance: async (): Promise<WalletBalanceData> => {
    const res = await axiosInstance.get(`${BASE}/balance`);
    return unwrapData<WalletBalanceData>(res);
  },

  getTransactions: async (take = 20, cursor?: string): Promise<WalletLedgerEntry[]> => {
    const res = await axiosInstance.get(`${BASE}/transactions`, {
      params: { take, ...(cursor ? { cursor } : {}) },
    });
    return unwrapData<WalletLedgerEntry[]>(res);
  },

  createTopUpPaymentIntent: async (
    amountEur: number
  ): Promise<{ clientSecret: string | null; paymentIntentId: string }> => {
    const res = await axiosInstance.post(`${BASE}/top-up/payment-intent`, { amountEur });
    return unwrapData<{ clientSecret: string | null; paymentIntentId: string }>(res);
  },

  syncTopUpAfterPayment: async (
    paymentIntentId: string
  ): Promise<{ applied: boolean; duplicate?: boolean }> => {
    const res = await axiosInstance.post(`${BASE}/top-up/sync`, { paymentIntentId });
    return unwrapData<{ applied: boolean; duplicate?: boolean }>(res);
  },

  requestWithdrawal: async (payload: WithdrawalPayload): Promise<{ id: string }> => {
    const res = await axiosInstance.post(`${BASE}/withdrawals`, payload);
    return unwrapData<{ id: string }>(res);
  },
};
