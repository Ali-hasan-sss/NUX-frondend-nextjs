import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminInvoicesService } from "./adminInvoicesService";
import {
  FetchAdminInvoicesParams,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  MarkInvoiceAsPaidRequest,
  AdminInvoice,
  AdminInvoicesResponse,
  InvoiceStatistics,
} from "./adminInvoicesTypes";

// Fetch all invoices with filters and pagination
export const fetchAdminInvoices = createAsyncThunk<
  AdminInvoicesResponse,
  FetchAdminInvoicesParams
>("adminInvoices/fetchInvoices", async (params, { rejectWithValue }) => {
  try {
    const response = await adminInvoicesService.getInvoices(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch invoices");
  }
});

// Fetch invoice by ID
export const fetchAdminInvoiceById = createAsyncThunk<
  { invoice: AdminInvoice },
  string
>("adminInvoices/fetchInvoiceById", async (id, { rejectWithValue }) => {
  try {
    const response = await adminInvoicesService.getInvoiceById(id);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch invoice");
  }
});

// Create new invoice
export const createAdminInvoice = createAsyncThunk<
  { invoice: AdminInvoice },
  CreateInvoiceRequest
>("adminInvoices/createInvoice", async (data, { rejectWithValue }) => {
  try {
    const response = await adminInvoicesService.createInvoice(data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create invoice");
  }
});

// Update invoice
export const updateAdminInvoice = createAsyncThunk<
  { invoice: AdminInvoice },
  { id: string; data: UpdateInvoiceRequest }
>("adminInvoices/updateInvoice", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await adminInvoicesService.updateInvoice(id, data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update invoice");
  }
});

// Delete invoice
export const deleteAdminInvoice = createAsyncThunk<void, string>(
  "adminInvoices/deleteInvoice",
  async (id, { rejectWithValue }) => {
    try {
      await adminInvoicesService.deleteInvoice(id);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete invoice");
    }
  }
);

// Mark invoice as paid
export const markAdminInvoiceAsPaid = createAsyncThunk<
  { invoice: AdminInvoice },
  { id: string; data: MarkInvoiceAsPaidRequest }
>(
  "adminInvoices/markInvoiceAsPaid",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminInvoicesService.markInvoiceAsPaid(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark invoice as paid");
    }
  }
);

// Fetch invoice statistics
export const fetchAdminInvoiceStatistics = createAsyncThunk<
  { statistics: InvoiceStatistics },
  { startDate?: string; endDate?: string }
>("adminInvoices/fetchStatistics", async (params, { rejectWithValue }) => {
  try {
    const response = await adminInvoicesService.getStatistics(
      params.startDate,
      params.endDate
    );
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch statistics");
  }
});
