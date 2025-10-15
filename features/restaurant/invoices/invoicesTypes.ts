export interface Invoice {
  id: string;
  restaurantId: string;
  subscriptionId?: number;
  stripeInvoiceId?: string;
  hostedInvoiceUrl?: string;
  pdfUrl?: string;
  amountDue: number;
  amountPaid?: number;
  currency: string;
  status: "PENDING" | "PAID" | "UNPAID" | "CANCELLED" | "FAILED";
  periodStart?: string;
  periodEnd?: string;
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
  restaurant?: {
    id: string;
    name: string;
    address: string;
    logo?: string;
  };
  subscription?: {
    id: number;
    startDate?: string;
    endDate?: string;
    status: string;
    plan?: {
      id: number;
      title: string;
      price: number;
      currency: string;
      duration: number;
    };
  };
  payment?: {
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    createdAt: string;
    paymentMethod: string;
  };
}

export interface InvoicesState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  loading: {
    invoices: boolean;
    selectedInvoice: boolean;
  };
  error: {
    invoices: string | null;
    selectedInvoice: string | null;
  };
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface InvoicesApiResponse {
  success: boolean;
  message: string;
  data: {
    invoices: Invoice[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

export interface InvoiceApiResponse {
  success: boolean;
  message: string;
  data: Invoice;
}
