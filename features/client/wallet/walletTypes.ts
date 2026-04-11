export interface WalletBalanceData {
  balance: string;
  currency: string;
}

export interface WalletLedgerEntry {
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

export interface PayRestaurantPayload {
  restaurantId: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  orderReference?: string;
}

/** Response from POST /client/wallet/pay-restaurant/request */
export interface WalletPayApprovalRequestData {
  approvalId: string;
  approvalToken: string;
  expiresAt: string;
  restaurantName: string;
  amount: string;
  currency: string;
  initiatedFrom: string;
}

export interface WithdrawalPayload {
  amount: number;
  currency?: string;
  accountInfo: Record<string, string>;
}

export interface WalletState {
  balance: WalletBalanceData | null;
  transactions: WalletLedgerEntry[];
  transactionsCursor: string | null;
  hasMoreTransactions: boolean;
  loading: {
    balance: boolean;
    transactions: boolean;
    topUpIntent: boolean;
    pay: boolean;
    withdraw: boolean;
  };
  error: {
    balance: string | null;
    transactions: string | null;
    topUpIntent: string | null;
    pay: string | null;
    withdraw: string | null;
  };
}
