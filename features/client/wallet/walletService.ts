import { axiosInstance } from "@/utils/axiosInstance";
import type {
  WalletBalanceData,
  WalletLedgerEntry,
  PayRestaurantPayload,
  WithdrawalPayload,
  WalletPayApprovalRequestData,
} from "./walletTypes";

const CLIENT_WALLET = "/client/wallet";

function unwrapData<T>(res: { data: { success?: boolean; data?: T; message?: string } }): T {
  const body = res.data;
  if (body?.data !== undefined) return body.data as T;
  return body as unknown as T;
}

export const walletService = {
  getBalance: async (): Promise<WalletBalanceData> => {
    const res = await axiosInstance.get(`${CLIENT_WALLET}/balance`);
    return unwrapData<WalletBalanceData>(res);
  },

  getTransactions: async (take = 20, cursor?: string): Promise<WalletLedgerEntry[]> => {
    const res = await axiosInstance.get(`${CLIENT_WALLET}/transactions`, {
      params: { take, ...(cursor ? { cursor } : {}) },
    });
    return unwrapData<WalletLedgerEntry[]>(res);
  },

  createTopUpPaymentIntent: async (
    amountEur: number
  ): Promise<{ clientSecret: string | null; paymentIntentId: string }> => {
    const res = await axiosInstance.post(`${CLIENT_WALLET}/top-up/payment-intent`, {
      amountEur,
    });
    return unwrapData<{ clientSecret: string | null; paymentIntentId: string }>(res);
  },

  /** Apply wallet credit immediately after Stripe confirms payment (same logic as webhook; safe for local dev). */
  syncTopUpAfterPayment: async (
    paymentIntentId: string
  ): Promise<{ applied: boolean; duplicate?: boolean }> => {
    const res = await axiosInstance.post(`${CLIENT_WALLET}/top-up/sync`, {
      paymentIntentId,
    });
    return unwrapData<{ applied: boolean; duplicate?: boolean }>(res);
  },

  /** Start wallet pay; user must approve on mobile (WebSocket + PIN/biometric). */
  requestPayRestaurant: async (
    payload: PayRestaurantPayload
  ): Promise<WalletPayApprovalRequestData> => {
    const res = await axiosInstance.post(`${CLIENT_WALLET}/pay-restaurant/request`, {
      ...payload,
      initiatedFrom: "web",
    });
    return unwrapData<WalletPayApprovalRequestData>(res);
  },

  rejectPayRestaurantApproval: async (approvalId: string): Promise<void> => {
    await axiosInstance.post(`${CLIENT_WALLET}/pay-restaurant/reject`, { approvalId });
  },

  requestWithdrawal: async (payload: WithdrawalPayload): Promise<{ id: string }> => {
    const res = await axiosInstance.post(`${CLIENT_WALLET}/withdrawals`, payload);
    return unwrapData<{ id: string }>(res);
  },

  /** Restaurant owner — ledger credits from customer wallet payments */
  getRestaurantWalletBalance: async (): Promise<WalletBalanceData> => {
    const res = await axiosInstance.get("/restaurants/account/wallet/balance");
    return unwrapData<WalletBalanceData>(res);
  },
};
