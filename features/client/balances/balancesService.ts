import { axiosInstance } from "@/utils/axiosInstance";
import {
  BalancesApiResponse,
  PackagesApiResponse,
  QrScanApiResponse,
  PaymentApiResponse,
  QrScanData,
  PaymentData,
  GiftData,
} from "./balancesTypes";

const API_URL = "/client/balance";

export const balancesService = {
  // Get user restaurants with balance
  getUserBalances: async (): Promise<BalancesApiResponse> => {
    const response = await axiosInstance.get(`${API_URL}/with-restaurants`);
    return response.data;
  },

  // Scan QR code
  scanQrCode: async (data: QrScanData): Promise<QrScanApiResponse> => {
    const response = await axiosInstance.post(`${API_URL}/scan-qr`, data);
    return response.data;
  },

  // Pay at restaurant
  payAtRestaurant: async (data: PaymentData): Promise<PaymentApiResponse> => {
    const response = await axiosInstance.post(`${API_URL}/pay`, data);
    return response.data;
  },

  // Validate if QR code is a valid gift recipient (user QR, not restaurant)
  validateGiftRecipient: async (
    qrCode: string
  ): Promise<{ valid: boolean; reason?: "restaurant_code" | "not_found" | "self" }> => {
    const response = await axiosInstance.get(
      `${API_URL}/validate-gift-recipient`,
      { params: { qrCode } }
    );
    const data = response.data?.data ?? response.data;
    return {
      valid: Boolean(data?.valid),
      reason: data?.reason,
    };
  },

  // Gift balance to friend
  giftBalance: async (data: GiftData): Promise<PaymentApiResponse> => {
    const response = await axiosInstance.post(`${API_URL}/gift`, data);
    return response.data;
  },

  // Get public packages for restaurant
  getPublicPackages: async (
    restaurantId: string
  ): Promise<PackagesApiResponse> => {
    const response = await axiosInstance.get(
      `${API_URL}/packages/${restaurantId}`
    );
    return response.data;
  },
};
