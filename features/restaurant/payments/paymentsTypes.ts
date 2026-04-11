// Restaurant Payments Types
export interface PaymentUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface RestaurantPayment {
  id: string;
  userId: string;
  restaurantId: string;
  amount: number;
  paymentType: "balance" | "stars_meal" | "stars_drink";
  createdAt: string;
  user: PaymentUser;
}

export interface PaymentPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaymentsResponse {
  payments: RestaurantPayment[];
  pagination: PaymentPagination;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  starsMealPayments: number;
  starsDrinkPayments: number;
  /** Sum of `amount` for meal-star redemptions (voucher points). */
  starsMealAmountSum: number;
  /** Sum of `amount` for drink-star redemptions (voucher points). */
  starsDrinkAmountSum: number;
  /** Stars granted from QR scans (meal), same date range as payment stats. */
  scanStarsMealGrantedTotal: number;
  /** Stars granted from QR scans (drink), same date range as payment stats. */
  scanStarsDrinkGrantedTotal: number;
  scanMealCount: number;
  scanDrinkCount: number;
  /** True when scan-granted stars ≥ redeemed stars for both meal and drink in this period. */
  pointsIntegrityHealthy: boolean;
  pointsIntegrityMealOk: boolean;
  pointsIntegrityDrinkOk: boolean;
  uniqueCustomers: number;
  paymentsToday: number;
  paymentsThisWeek: number;
  paymentsThisMonth: number;
}

export interface FetchPaymentsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  paymentType?: "balance" | "stars_meal" | "stars_drink" | "all";
}

export interface FetchPaymentStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface PaymentsState {
  payments: RestaurantPayment[];
  pagination: PaymentPagination | null;
  stats: PaymentStats | null;
  isLoading: boolean;
  error: string | null;
}
