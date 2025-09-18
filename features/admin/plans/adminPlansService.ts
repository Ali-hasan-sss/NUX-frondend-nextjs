import { axiosInstance } from "@/utils/axiosInstance";
import type {
  AdminPlan,
  CreateAdminPlanRequest,
  UpdateAdminPlanRequest,
  PlanPermission,
} from "./adminPlansTypes";

function mapPlan(api: any): AdminPlan {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? null,
    currency: api.currency ?? null,
    price: api.price,
    duration: api.duration,
    isActive: Boolean(api.isActive),
    permissions:
      api.permissions?.map((perm: any) => ({
        id: perm.id,
        type: perm.type,
        value: perm.value,
        isUnlimited: Boolean(perm.isUnlimited),
      })) || [],
    stripeProductId: api.stripeProductId ?? null,
    stripePriceId: api.stripePriceId ?? null,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    subscriberCount: api.subscriberCount,
  };
}

export const adminPlansService = {
  async getAll(): Promise<AdminPlan[]> {
    const response = await axiosInstance.get("/admin/plans");
    const api = response.data;
    const list = Array.isArray(api.data) ? api.data : api.data?.items || [];
    return list.map(mapPlan);
  },

  async getById(id: string): Promise<AdminPlan> {
    const response = await axiosInstance.get(`/admin/plans/${id}`);
    return mapPlan(response.data?.data ?? response.data);
  },

  async create(data: CreateAdminPlanRequest): Promise<AdminPlan> {
    const response = await axiosInstance.post("/admin/plans", data);
    return mapPlan(response.data?.data ?? response.data);
  },

  async update(id: string, data: UpdateAdminPlanRequest): Promise<AdminPlan> {
    const response = await axiosInstance.put(`/admin/plans/${id}`, data);
    return mapPlan(response.data?.data ?? response.data);
  },

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/plans/${id}`);
  },
};
