export interface AdminInvoice {
  id: string;
  restaurantId: string;
  subscriptionId?: number | null;
  stripeInvoiceId?: string | null;
  hostedInvoiceUrl?: string | null;
  pdfUrl?: string | null;
  amountDue: number;
  amountPaid?: number | null;
  currency: string;
  status: "PENDING" | "PAID" | "UNPAID" | "CANCELLED" | "FAILED";
  paymentMethod?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
  updatedAt: string;

  restaurant: {
    id: string;
    name: string;
    address: string;
    owner: {
      id: string;
      fullName: string;
      email: string;
    };
  };

  subscription?: {
    id: number;
    status: string;
    plan: {
      id: number;
      title: string;
      price: number;
      currency: string;
    };
  } | null;

  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
  } | null;
}

export interface CreateInvoiceRequest {
  restaurantId: string;
  subscriptionId?: number;
  amountDue: number;
  amountPaid?: number;
  currency?: string;
  status?: "PENDING" | "PAID" | "UNPAID" | "CANCELLED" | "FAILED";
  paymentMethod?: string;
  periodStart?: string;
  periodEnd?: string;
  description?: string;
}

export interface UpdateInvoiceRequest {
  amountDue?: number;
  amountPaid?: number;
  status?: "PENDING" | "PAID" | "UNPAID" | "CANCELLED" | "FAILED";
  paymentMethod?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface MarkInvoiceAsPaidRequest {
  paymentMethod?: string;
  amountPaid?: number;
}

export interface AdminInvoicesPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FetchAdminInvoicesParams {
  search?: string;
  restaurantId?: string;
  status?: "PENDING" | "PAID" | "UNPAID" | "CANCELLED" | "FAILED";
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminInvoicesResponse {
  invoices: AdminInvoice[];
  pagination: AdminInvoicesPagination;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  paidPercentage: string;
}

export interface AdminInvoicesState {
  invoices: AdminInvoice[];
  statistics: InvoiceStatistics | null;
  pagination: AdminInvoicesPagination | null;
  isLoading: boolean;
  error: string | null;
  selectedInvoice: AdminInvoice | null;
}
