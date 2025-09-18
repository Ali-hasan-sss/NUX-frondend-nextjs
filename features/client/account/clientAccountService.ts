import { axiosInstance } from "@/utils/axiosInstance";
import {
  ClientProfileApiResponse,
  ClientAccountApiResponse,
  UpdateClientProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from "./clientAccountTypes";

const API_URL = "/client/account";

export const clientAccountService = {
  // Get current user profile
  getProfile: async (): Promise<ClientProfileApiResponse> => {
    const response = await axiosInstance.get(`${API_URL}/me`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    data: UpdateClientProfileRequest
  ): Promise<ClientAccountApiResponse> => {
    const response = await axiosInstance.put(`${API_URL}/me`, data);
    return response.data;
  },

  // Change password
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ClientAccountApiResponse> => {
    const response = await axiosInstance.put(
      `${API_URL}/me/change-password`,
      data
    );
    return response.data;
  },

  // Delete account
  deleteAccount: async (
    data: DeleteAccountRequest
  ): Promise<ClientAccountApiResponse> => {
    const response = await axiosInstance.delete(`${API_URL}/me`, { data });
    return response.data;
  },
};
