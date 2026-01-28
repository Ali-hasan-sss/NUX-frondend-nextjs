import { axiosInstance } from "@/utils/axiosInstance";

export interface OrderItem {
  id?: number;
  title: string;
  description?: string;
  image?: string;
  price: number;
  quantity: number;
  selectedExtras?: Array<{ name: string; price: number; calories: number }>;
  notes?: string;
  preparationTime?: number;
  baseCalories?: number;
  allergies?: string[];
  kitchenSection?: {
    id: number;
    name: string;
    description?: string;
  };
}

export type OrderTypeValue = "ON_TABLE" | "TAKE_AWAY";

export interface CreateOrderPayload {
  restaurantId: string;
  tableNumber?: number | null;
  orderType?: OrderTypeValue;
  items: OrderItem[];
  totalPrice: number;
}

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

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await axiosInstance.post("/customer/orders", payload);
    return res.data?.data as Order;
  },
};
