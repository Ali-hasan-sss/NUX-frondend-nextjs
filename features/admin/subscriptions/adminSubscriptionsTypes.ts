export interface AdminSubscription {
  id: number | string;
  restaurantId: string;
  planId: number | string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PENDING";
  paymentId?: string | null;
  paymentMethod?: string | null;
  transactionRef?: string | null;
  createdAt?: string;
  updatedAt?: string;

  restaurant: {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
    isSubscriptionActive: boolean;
    owner: {
      id: string;
      fullName: string;
      email: string;
    };
  };

  plan: {
    id: number | string;
    title: string;
    description?: string | null;
    price: number;
    duration: number;
    currency?: string | null;
  };
}

export interface CancelSubscriptionRequest {
  reason: string;
}

export interface ActivateSubscriptionPayload {
  restaurantId: string;
  planId: number;
}

export interface AdminSubscriptionsPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface FetchAdminSubscriptionsParams {
  search?: string;
  planId?: number;
  status?: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PENDING";
  page?: number;
  pageSize?: number;
}

export interface AdminSubscriptionsResponse {
  items: AdminSubscription[];
  pagination: AdminSubscriptionsPagination;
  statistics: Statistics;
}

export interface Statistics {
  active: number;
  cancelled: number;
  expired: number;
  totalValue: number;
}
export interface AdminSubscriptionsState {
  items: AdminSubscription[];
  statistics: Statistics;
  pagination: AdminSubscriptionsPagination;
  isLoading: boolean;
  error: string | null;
}
