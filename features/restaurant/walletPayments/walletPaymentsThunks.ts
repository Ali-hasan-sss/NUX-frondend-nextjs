import { createAsyncThunk } from "@reduxjs/toolkit";
import { walletPaymentsService } from "./walletPaymentsService";
import type {
  FetchWalletPaymentsParams,
  WalletLedgerReportResponse,
  WalletLedgerStats,
} from "./walletPaymentsTypes";

export const fetchWalletPaymentsData = createAsyncThunk<
  { report: WalletLedgerReportResponse; stats: WalletLedgerStats },
  FetchWalletPaymentsParams,
  { rejectValue: string }
>(
  "walletPayments/fetchWalletPaymentsData",
  async (params, { rejectWithValue }) => {
    try {
      const [report, stats] = await Promise.all([
        walletPaymentsService.getReport(params),
        walletPaymentsService.getStats({
          startDate: params.startDate,
          endDate: params.endDate,
        }),
      ]);
      return { report, stats };
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load wallet payments";
      return rejectWithValue(message);
    }
  },
);
