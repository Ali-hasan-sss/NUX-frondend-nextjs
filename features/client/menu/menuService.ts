import { axiosInstance } from "@/utils/axiosInstance";
import { MenuCategoriesApiResponse, MenuItemsApiResponse } from "./menuTypes";

const API_URL = "/client/menu";

export const menuService = {
  // Get menu categories by QR code (restaurant ID)
  getCategoriesByQRCode: async (
    qrCode: string
  ): Promise<MenuCategoriesApiResponse> => {
    const response = await axiosInstance.get(`${API_URL}/${qrCode}`);
    return response.data;
  },

  // Get menu items by category ID
  getItemsByCategory: async (
    categoryId: number
  ): Promise<MenuItemsApiResponse> => {
    const response = await axiosInstance.get(`${API_URL}/items/${categoryId}`);
    return response.data;
  },
};
