import { axiosInstance } from "@/utils/axiosInstance";
import type {
  WalletLedgerReportResponse,
  WalletLedgerStats,
  FetchWalletPaymentsParams,
} from "./walletPaymentsTypes";

const BASE = "/restaurants/account/wallet";

function unwrapData<T>(res: {
  data: { success?: boolean; data?: T; message?: string };
}): T {
  const body = res.data;
  if (body?.data !== undefined) return body.data as T;
  return body as unknown as T;
}

export const walletPaymentsService = {
  async getReport(
    params: FetchWalletPaymentsParams = {},
  ): Promise<WalletLedgerReportResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const res = await axiosInstance.get(
      `${BASE}/transactions/report?${queryParams.toString()}`,
    );
    return unwrapData<WalletLedgerReportResponse>(res);
  },

  async getStats(params: {
    startDate?: string;
    endDate?: string;
  }): Promise<WalletLedgerStats> {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    const res = await axiosInstance.get(
      `${BASE}/transactions/stats?${queryParams.toString()}`,
    );
    return unwrapData<WalletLedgerStats>(res);
  },
};
