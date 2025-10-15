import { createAsyncThunk } from '@reduxjs/toolkit';
import { invoicesService } from './invoicesService';
import { Invoice } from './invoicesTypes';

// Get all restaurant invoices
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}) => {
    try {
      console.log('Fetching invoices with page:', page, 'pageSize:', pageSize);
      const response = await invoicesService.getInvoices(page, pageSize);
      console.log('Invoices API response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      throw error.response?.data?.message || 'Failed to fetch invoices';
    }
  }
);

// Get invoice by ID
export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchInvoiceById',
  async (id: string) => {
    try {
      console.log('Fetching invoice by ID:', id);
      const response = await invoicesService.getInvoiceById(id);
      console.log('Invoice API response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      throw error.response?.data?.message || 'Failed to fetch invoice';
    }
  }
);

// Clear selected invoice
export const clearSelectedInvoice = createAsyncThunk(
  'invoices/clearSelectedInvoice',
  async () => {
    return null;
  }
);
