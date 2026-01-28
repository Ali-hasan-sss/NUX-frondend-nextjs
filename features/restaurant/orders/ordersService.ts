import { axiosInstance } from "@/utils/axiosInstance";

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId?: number | null;
  itemTitle: string;
  itemDescription?: string | null;
  itemImage?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedExtras?: Array<{ name: string; price: number; calories: number }> | null;
  notes?: string | null;
  preparationTime?: number | null;
  baseCalories?: number | null;
  allergies?: string[];
  kitchenSection?: string | null;
}

export type OrderTypeValue = "ON_TABLE" | "TAKE_AWAY";

export interface Order {
  id: number;
  restaurantId: string;
  tableId?: number | null;
  tableNumber?: number | null;
  orderType?: OrderTypeValue;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  table?: {
    id: number;
    number: number;
    name: string;
  } | null;
}

export interface GetOrdersParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const ordersService = {
  async getOrders(params?: GetOrdersParams): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    const res = await axiosInstance.get(
      `/restaurants/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return res.data as OrdersResponse;
  },

  async getOrderById(orderId: number): Promise<{ success: boolean; data: Order }> {
    const res = await axiosInstance.get(`/restaurants/orders/${orderId}`);
    return res.data as { success: boolean; data: Order };
  },

  async updateOrderStatus(
    orderId: number,
    status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
  ): Promise<{ success: boolean; data: Order }> {
    const res = await axiosInstance.put(`/restaurants/orders/${orderId}/status`, { status });
    return res.data as { success: boolean; data: Order };
  },
};
