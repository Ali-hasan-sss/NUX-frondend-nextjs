export interface WalletLedgerReportEntry {
  id: string;
  walletId: string;
  type: "CREDIT" | "DEBIT";
  amount: string;
  status: string;
  source: string;
  referenceId: string | null;
  metadata: unknown;
  idempotencyKey: string | null;
  createdAt: string;
}

export interface WalletLedgerReportPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface WalletLedgerReportResponse {
  entries: WalletLedgerReportEntry[];
  pagination: WalletLedgerReportPagination;
  currency: string;
}

export interface WalletLedgerStats {
  totalEntries: number;
  creditsTotal: string;
  debitsTotal: string;
  netChange: string;
  currency: string;
  entriesToday: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
}

export interface FetchWalletPaymentsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface WalletPaymentsState {
  entries: WalletLedgerReportEntry[];
  pagination: WalletLedgerReportPagination | null;
  stats: WalletLedgerStats | null;
  currency: string;
  isLoading: boolean;
  error: string | null;
}
