import { axiosInstance } from "@/utils/axiosInstance";
import type {
  AdminRestaurant,
  AdminRestaurantsFilters,
  CreateAdminRestaurantRequest,
  UpdateAdminRestaurantRequest,
} from "./adminRestaurantsTypes";
import type { AdminSubscription } from "../subscriptions/adminSubscriptionsTypes";

function mapRestaurant(api: any): AdminRestaurant {
  const restaurantMinimal = {
    id: api.id,
    name: api.name,
    address: api.address,
    isActive: Boolean(api.isActive),
    isSubscriptionActive: Boolean(
      api.isSubscriptionActive ?? api.subscriptionActive
    ),
    owner: {
      id: api.owner?.id,
      fullName: api.owner?.fullName,
      email: api.owner?.email,
    },
  };

  const subscriptions: AdminSubscription[] = Array.isArray(api.subscriptions)
    ? api.subscriptions.map((sub: any) => ({
        id: sub.id,
        restaurantId: sub.restaurantId,
        planId: sub.planId,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: sub.status,
        paymentId: sub.paymentId ?? null,
        paymentMethod: sub.paymentMethod ?? null,
        transactionRef: sub.transactionRef ?? null,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        restaurant: restaurantMinimal as any,
        plan: {
          id: sub.plan?.id,
          title: sub.plan?.title,
          description: sub.plan?.description ?? null,
          price: sub.plan?.price,
          duration: sub.plan?.duration,
          currency: sub.plan?.currency ?? null,
        },
      }))
    : [];

  return {
    id: api.id,
    name: api.name,
    logo: api.logo ?? null,
    address: api.address,
    latitude: api.latitude,
    longitude: api.longitude,
    planId: api.planId ?? api.plan ?? undefined,
    isSubscriptionActive: Boolean(
      api.isSubscriptionActive ?? api.subscriptionActive
    ),
    createdAt: api.createdAt,
    owner: {
      id: api.owner?.id,
      fullName: api.owner?.fullName,
      email: api.owner?.email,
      isActive: Boolean(api.owner?.isActive),
      createdAt: api.owner?.createdAt,
      role: "RESTAURANT_OWNER",
    },
    subscriptions,
    currentSubscription: api.currentSubscription
      ? {
          planName: api.currentSubscription.planName,
          price: api.currentSubscription.price,
          endDate: api.currentSubscription.endDate,
          status: api.currentSubscription.status,
        }
      : null,
    isActive: Boolean(api.isActive),
  };
}

export const adminRestaurantsService = {
  async getAll(
    filters: AdminRestaurantsFilters = {}
  ): Promise<{ items: AdminRestaurant[]; pagination: any }> {
    const response = await axiosInstance.get("/admin/restaurants", {
      params: filters,
    });

    const api = response.data;
    const list = Array.isArray(api.data) ? api.data : api.data?.items || [];

    const items = list.map(mapRestaurant);

    const pagination = {
      totalItems: api.pagination?.totalItems ?? 0,
      totalPages: api.pagination?.totalPages ?? 1,
      currentPage: api.pagination?.currentPage ?? filters.page ?? 1,
      pageSize: api.pagination?.pageSize ?? filters.pageSize ?? 10,
    };

    return { items, pagination };
  },

  async getById(id: string): Promise<AdminRestaurant> {
    const response = await axiosInstance.get(`/admin/restaurants/${id}`);
    const api = response.data;
    return mapRestaurant(api.data);
  },

  async createRestaurant(
    payload: CreateAdminRestaurantRequest
  ): Promise<AdminRestaurant> {
    const response = await axiosInstance.post("/admin/restaurants", payload);
    const api = response.data;
    return mapRestaurant(api.data);
  },

  async updateRestaurant(
    id: string,
    payload: UpdateAdminRestaurantRequest
  ): Promise<AdminRestaurant> {
    const response = await axiosInstance.put(
      `/admin/restaurants/${id}`,
      payload
    );
    const api = response.data;
    return mapRestaurant(api.data);
  },

  async deleteRestaurant(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/restaurants/${id}`);
  },
};
