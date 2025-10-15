import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminInvoice,
  AdminInvoicesPagination,
  InvoiceStatistics,
  AdminInvoicesState,
} from "./adminInvoicesTypes";
import {
  fetchAdminInvoices,
  fetchAdminInvoiceById,
  createAdminInvoice,
  updateAdminInvoice,
  deleteAdminInvoice,
  markAdminInvoiceAsPaid,
  fetchAdminInvoiceStatistics,
} from "./adminInvoicesThunks";

const initialState: AdminInvoicesState = {
  invoices: [],
  statistics: null,
  pagination: null,
  isLoading: false,
  error: null,
  selectedInvoice: null,
};

const adminInvoicesSlice = createSlice({
  name: "adminInvoices",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set invoices data
    setInvoices: (state, action: PayloadAction<AdminInvoice[]>) => {
      state.invoices = action.payload;
    },

    // Set pagination data
    setPagination: (state, action: PayloadAction<AdminInvoicesPagination>) => {
      state.pagination = action.payload;
    },

    // Set statistics data
    setStatistics: (state, action: PayloadAction<InvoiceStatistics>) => {
      state.statistics = action.payload;
    },

    // Set selected invoice
    setSelectedInvoice: (state, action: PayloadAction<AdminInvoice | null>) => {
      state.selectedInvoice = action.payload;
    },

    // Add new invoice
    addInvoice: (state, action: PayloadAction<AdminInvoice>) => {
      state.invoices.unshift(action.payload);
    },

    // Update existing invoice
    updateInvoice: (state, action: PayloadAction<AdminInvoice>) => {
      const index = state.invoices.findIndex(
        (invoice) => invoice.id === action.payload.id
      );
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },

    // Remove invoice
    removeInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(
        (invoice) => invoice.id !== action.payload
      );
    },

    // Clear all data
    clearData: (state) => {
      state.invoices = [];
      state.statistics = null;
      state.pagination = null;
      state.selectedInvoice = null;
      state.error = null;
    },

    // Reset state
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch invoices
    builder
      .addCase(fetchAdminInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAdminInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch invoice by ID
    builder
      .addCase(fetchAdminInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedInvoice = action.payload.invoice;
        state.error = null;
      })
      .addCase(fetchAdminInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create invoice
    builder
      .addCase(createAdminInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdminInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload.invoice);
        state.error = null;
      })
      .addCase(createAdminInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update invoice
    builder
      .addCase(updateAdminInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.invoice.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload.invoice;
        }
        state.error = null;
      })
      .addCase(updateAdminInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete invoice
    builder
      .addCase(deleteAdminInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdminInvoice.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteAdminInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark invoice as paid
    builder
      .addCase(markAdminInvoiceAsPaid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAdminInvoiceAsPaid.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.invoice.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload.invoice;
        }
        state.error = null;
      })
      .addCase(markAdminInvoiceAsPaid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch statistics
    builder
      .addCase(fetchAdminInvoiceStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminInvoiceStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload.statistics;
        state.error = null;
      })
      .addCase(fetchAdminInvoiceStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setInvoices,
  setPagination,
  setStatistics,
  setSelectedInvoice,
  addInvoice,
  updateInvoice,
  removeInvoice,
  clearData,
  resetState,
} = adminInvoicesSlice.actions;

export default adminInvoicesSlice.reducer;
