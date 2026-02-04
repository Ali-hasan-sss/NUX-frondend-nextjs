import { axiosInstance } from "@/utils/axiosInstance";

export interface Table {
  id: number;
  restaurantId: string;
  name: string;
  number: number;
  qrCode: string;
  isActive: boolean;
  isSessionOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTablesPayload {
  count: number;
  name?: string;
}

export interface UpdateTablePayload {
  name?: string;
  isActive?: boolean;
  isSessionOpen?: boolean;
}

export const tablesService = {
  async getTables(): Promise<{ success: boolean; data: Table[] }> {
    const res = await axiosInstance.get("/restaurants/tables");
    return res.data as { success: boolean; data: Table[] };
  },

  async createTables(
    payload: CreateTablesPayload
  ): Promise<{ success: boolean; data: Table[] }> {
    const res = await axiosInstance.post("/restaurants/tables", payload);
    return res.data as { success: boolean; data: Table[] };
  },

  async updateTable(
    tableId: number,
    payload: UpdateTablePayload
  ): Promise<{ success: boolean; data: Table }> {
    const res = await axiosInstance.put(
      `/restaurants/tables/${tableId}`,
      payload
    );
    return res.data as { success: boolean; data: Table };
  },

  async deleteTable(tableId: number): Promise<{ success: boolean }> {
    const res = await axiosInstance.delete(`/restaurants/tables/${tableId}`);
    return res.data as { success: boolean };
  },
};
