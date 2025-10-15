import { axiosInstance } from "@/utils/axiosInstance";
import {
  PaymentsResponse,
  PaymentStats,
  FetchPaymentsParams,
  FetchPaymentStatsParams,
} from "./paymentsTypes";

const API_URL = "/restaurants/payments";

export const paymentsService = {
  // Get restaurant payments with filtering and pagination
  async getPayments(
    params: FetchPaymentsParams = {}
  ): Promise<PaymentsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.paymentType && params.paymentType !== "all") {
      queryParams.append("paymentType", params.paymentType);
    }

    const response = await axiosInstance.get(
      `${API_URL}?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get payment statistics
  async getPaymentStats(
    params: FetchPaymentStatsParams = {}
  ): Promise<PaymentStats> {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await axiosInstance.get(
      `${API_URL}/stats?${queryParams.toString()}`
    );
    return response.data.data;
  },
};
