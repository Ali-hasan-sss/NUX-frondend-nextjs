import { axiosInstance } from "@/utils/axiosInstance";
import {
  AdminInvoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  MarkInvoiceAsPaidRequest,
  FetchAdminInvoicesParams,
  AdminInvoicesResponse,
  InvoiceStatistics,
} from "./adminInvoicesTypes";

const API_URL = "/admin/invoices";

export const adminInvoicesService = {
  // Get all invoices with filters and pagination
  async getInvoices(
    params: FetchAdminInvoicesParams = {}
  ): Promise<AdminInvoicesResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);
    if (params.restaurantId)
      queryParams.append("restaurantId", params.restaurantId);
    if (params.status) queryParams.append("status", params.status);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const response = await axiosInstance.get(
      `${API_URL}?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get invoice by ID
  async getInvoiceById(id: string): Promise<{ invoice: AdminInvoice }> {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  // Create new invoice
  async createInvoice(
    data: CreateInvoiceRequest
  ): Promise<{ invoice: AdminInvoice }> {
    const response = await axiosInstance.post(API_URL, data);
    return response.data.data;
  },

  // Update invoice
  async updateInvoice(
    id: string,
    data: UpdateInvoiceRequest
  ): Promise<{ invoice: AdminInvoice }> {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    await axiosInstance.delete(`${API_URL}/${id}`);
  },

  // Mark invoice as paid
  async markInvoiceAsPaid(
    id: string,
    data: MarkInvoiceAsPaidRequest
  ): Promise<{ invoice: AdminInvoice }> {
    const response = await axiosInstance.patch(
      `${API_URL}/${id}/mark-paid`,
      data
    );
    return response.data.data;
  },

  // Get invoice statistics
  async getStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<{ statistics: InvoiceStatistics }> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const response = await axiosInstance.get(
      `${API_URL}/statistics?${queryParams.toString()}`
    );
    return response.data.data;
  },
};
