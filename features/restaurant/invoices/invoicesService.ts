import { axiosInstance } from "@/utils/axiosInstance";
import { InvoicesApiResponse, InvoiceApiResponse } from "./invoicesTypes";

export const invoicesService = {
  // Get all restaurant invoices
  getInvoices: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<InvoicesApiResponse> => {
    const response = await axiosInstance.get(
      `/restaurants/invoices?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Get invoice by ID
  getInvoiceById: async (id: string): Promise<InvoiceApiResponse> => {
    const response = await axiosInstance.get(`/restaurants/invoices/${id}`);
    return response.data;
  },
};
