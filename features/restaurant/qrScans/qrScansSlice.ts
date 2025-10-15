import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  QRScan,
  QRScanPagination,
  QRScanStats,
  QRScansState,
} from "./qrScansTypes";
import { fetchQRScans, fetchQRScanStats } from "./qrScansThunks";

const initialState: QRScansState = {
  scans: [],
  pagination: null,
  stats: null,
  isLoading: false,
  error: null,
};

const qrScansSlice = createSlice({
  name: "qrScans",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setScans: (state, action: PayloadAction<QRScan[]>) => {
      state.scans = action.payload;
    },
    setPagination: (state, action: PayloadAction<QRScanPagination>) => {
      state.pagination = action.payload;
    },
    setStats: (state, action: PayloadAction<QRScanStats>) => {
      state.stats = action.payload;
    },
    clearData: (state) => {
      state.scans = [];
      state.pagination = null;
      state.stats = null;
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch QR scans
    builder
      .addCase(fetchQRScans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQRScans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scans = action.payload.scans;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchQRScans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch QR scan stats
    builder
      .addCase(fetchQRScanStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQRScanStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchQRScanStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setScans,
  setPagination,
  setStats,
  clearData,
  resetState,
} = qrScansSlice.actions;

export default qrScansSlice.reducer;
