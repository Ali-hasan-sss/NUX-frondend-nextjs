import { axiosInstance } from "@/utils/axiosInstance";
import type {
  SubAdminItem,
  SubAdminPermissionType,
  CreateSubAdminRequest,
  UpdateSubAdminRequest,
} from "./subadminTypes";

export const subadminService = {
  async getMyPermissions(): Promise<{
    permissions: SubAdminPermissionType[];
    role: "ADMIN" | "SUBADMIN";
  }> {
    const response = await axiosInstance.get("/admin/subadmins/my-permissions");
    const api = response.data;
    return {
      permissions: api.data?.permissions ?? [],
      role: api.data?.role ?? "ADMIN",
    };
  },

  async list(): Promise<SubAdminItem[]> {
    const response = await axiosInstance.get("/admin/subadmins");
    const api = response.data;
    const list = api.data?.subAdmins ?? [];
    return list;
  },

  async create(payload: CreateSubAdminRequest): Promise<SubAdminItem> {
    const response = await axiosInstance.post("/admin/subadmins", payload);
    const api = response.data;
    return api.data;
  },

  async update(id: string, payload: UpdateSubAdminRequest): Promise<SubAdminItem> {
    const response = await axiosInstance.put(`/admin/subadmins/${id}`, payload);
    const api = response.data;
    return api.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/subadmins/${id}`);
  },
};
