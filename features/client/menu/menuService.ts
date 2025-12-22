import { axiosInstance } from "@/utils/axiosInstance";
import { MenuCategoriesApiResponse, MenuItemsApiResponse } from "./menuTypes";

const API_URL = "/customer/menu";

export const menuService = {
  // Get menu categories by QR code (restaurant ID)
  getCategoriesByQRCode: async (
    qrCode: string
  ): Promise<MenuCategoriesApiResponse> => {
    const url = `${API_URL}/${qrCode}`;
    const baseURL = axiosInstance.defaults.baseURL || "";
    const fullUrl = `${baseURL}${url}`;

    console.log("🌐 Menu Service: Fetching categories");
    console.log("  - Base URL:", baseURL);
    console.log("  - API URL:", url);
    console.log("  - Full URL:", fullUrl);
    console.log("  - QR Code:", qrCode);
    console.log(
      "  - QR Code is UUID:",
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        qrCode
      )
    );

    try {
      // Create request config to log headers
      const config = {
        headers: {} as any,
      };

      // The axios interceptor will add the token automatically
      const response = await axiosInstance.get(url, config);
      console.log("✅ Menu Service: Categories response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Menu Service: Error fetching categories");
      console.error("  - Error:", error.message);
      console.error("  - Response:", error.response?.data);
      console.error("  - Status:", error.response?.status);
      console.error("  - Request URL:", error.config?.url);
      console.error(
        "  - Request Headers:",
        JSON.stringify(error.config?.headers || {}, null, 2)
      );
      console.error("  - Full Error:", error);
      throw error;
    }
  },

  // Get menu items by category ID
  getItemsByCategory: async (
    categoryId: number
  ): Promise<MenuItemsApiResponse> => {
    const response = await axiosInstance.get(`${API_URL}/items/${categoryId}`);
    return response.data;
  },
};
