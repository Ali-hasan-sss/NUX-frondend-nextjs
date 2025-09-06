import { axiosInstance } from "@/utils/axiosInstance";
import type {
  AdminUser,
  AdminUsersFilters,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from "./adminUsersTypes";

function mapUser(apiUser: any): AdminUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.fullName,
    role: apiUser.role,
    isActive: Boolean(apiUser.isActive),
    isRestaurant: Boolean(apiUser.isRestaurant),
    createdAt: apiUser.createdAt,
  };
}

export const adminUsersService = {
  async getAll(filters: AdminUsersFilters = {}): Promise<{
    users: AdminUser[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }> {
    const response = await axiosInstance.get("/admin/users", {
      params: filters,
    });
    const api = response.data;

    const list = Array.isArray(api.data?.users) ? api.data.users : [];
    return {
      users: list.map(mapUser),
      pagination: api.data?.pagination || {
        totalItems: list.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: list.length,
      },
    };
  },

  async getById(id: string): Promise<AdminUser> {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    const api = response.data;
    return mapUser(api.data);
  },

  async createUser(payload: CreateAdminUserRequest): Promise<AdminUser> {
    const response = await axiosInstance.post("/admin/users", {
      ...payload,
      role: payload.role,
    });
    const api = response.data;
    return mapUser(api.data);
  },

  async updateUser(
    id: string,
    payload: UpdateAdminUserRequest
  ): Promise<AdminUser> {
    const response = await axiosInstance.put(`/admin/users/${id}`, {
      ...payload,
      role: payload.role ? payload.role : undefined,
    });
    const api = response.data;
    return mapUser(api.data);
  },

  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/users/${id}`);
  },
};
