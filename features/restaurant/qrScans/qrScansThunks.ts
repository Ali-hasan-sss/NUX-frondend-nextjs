import { createAsyncThunk } from "@reduxjs/toolkit";
import { qrScansService } from "./qrScansService";
import {
  QRScansResponse,
  QRScanStats,
  FetchQRScansParams,
  FetchQRScanStatsParams,
} from "./qrScansTypes";

// Fetch QR scans with filtering and pagination
export const fetchQRScans = createAsyncThunk<
  QRScansResponse,
  FetchQRScansParams,
  { rejectValue: string }
>("qrScans/fetchQRScans", async (params, { rejectWithValue }) => {
  try {
    const response = await qrScansService.getQRScans(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch QR scans"
    );
  }
});

// Fetch QR scan statistics
export const fetchQRScanStats = createAsyncThunk<
  QRScanStats,
  FetchQRScanStatsParams,
  { rejectValue: string }
>("qrScans/fetchQRScanStats", async (params, { rejectWithValue }) => {
  try {
    const response = await qrScansService.getQRScanStats(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch QR scan statistics"
    );
  }
});
