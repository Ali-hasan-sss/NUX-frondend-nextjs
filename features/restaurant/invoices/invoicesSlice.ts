import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvoicesState, Invoice } from './invoicesTypes';
import { fetchInvoices, fetchInvoiceById, clearSelectedInvoice } from './invoicesThunks';

const initialState: InvoicesState = {
  invoices: [],
  selectedInvoice: null,
  loading: {
    invoices: false,
    selectedInvoice: false,
  },
  error: {
    invoices: null,
    selectedInvoice: null,
  },
  pagination: {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  },
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearAllData: (state) => {
      state.invoices = [];
      state.selectedInvoice = null;
      state.loading = {
        invoices: false,
        selectedInvoice: false,
      };
      state.error = {
        invoices: null,
        selectedInvoice: null,
      };
      state.pagination = {
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading.invoices = true;
        state.error.invoices = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading.invoices = false;
        state.invoices = action.payload.invoices;
        state.pagination = action.payload.pagination;
        state.error.invoices = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading.invoices = false;
        state.error.invoices = action.error.message || 'Failed to fetch invoices';
      });

    // Fetch invoice by ID
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading.selectedInvoice = true;
        state.error.selectedInvoice = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading.selectedInvoice = false;
        state.selectedInvoice = action.payload;
        state.error.selectedInvoice = null;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading.selectedInvoice = false;
        state.error.selectedInvoice = action.error.message || 'Failed to fetch invoice';
      });

    // Clear selected invoice
    builder
      .addCase(clearSelectedInvoice.fulfilled, (state) => {
        state.selectedInvoice = null;
        state.error.selectedInvoice = null;
      });
  },
});

export const { clearAllData, setPage, setPageSize } = invoicesSlice.actions;
export default invoicesSlice.reducer;
