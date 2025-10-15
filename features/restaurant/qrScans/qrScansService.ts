import { axiosInstance } from "@/utils/axiosInstance";
import {
  QRScansResponse,
  QRScanStats,
  FetchQRScansParams,
  FetchQRScanStatsParams,
} from "./qrScansTypes";

const API_URL = "/restaurants/qr-scans";

export const qrScansService = {
  // Get QR scans with filtering and pagination
  async getQRScans(params: FetchQRScansParams = {}): Promise<QRScansResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.type) queryParams.append("type", params.type);

    const response = await axiosInstance.get(
      `${API_URL}?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get QR scan statistics
  async getQRScanStats(
    params: FetchQRScanStatsParams = {}
  ): Promise<QRScanStats> {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await axiosInstance.get(
      `${API_URL}/stats?${queryParams.toString()}`
    );
    return response.data.data;
  },
};
