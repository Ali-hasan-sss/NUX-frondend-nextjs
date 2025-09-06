import { axiosInstance } from "@/utils/axiosInstance";
import type {
  AdminSubscription,
  CancelSubscriptionRequest,
  ActivateSubscriptionPayload,
  AdminSubscriptionsResponse,
  FetchAdminSubscriptionsParams,
} from "./adminSubscriptionsTypes";

function mapSubscription(api: any): AdminSubscription {
  return {
    id: api.id,
    restaurantId: api.restaurantId,
    planId: api.planId,
    startDate: api.startDate,
    endDate: api.endDate,
    status: api.status,
    paymentId: api.paymentId ?? null,
    paymentMethod: api.paymentMethod ?? null,
    transactionRef: api.transactionRef ?? null,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    restaurant: {
      id: api.restaurant?.id,
      name: api.restaurant?.name,
      address: api.restaurant?.address,
      isActive: Boolean(api.restaurant?.isActive),
      isSubscriptionActive: Boolean(api.restaurant?.isSubscriptionActive),
      owner: {
        id: api.restaurant?.owner?.id,
        fullName: api.restaurant?.owner?.fullName,
        email: api.restaurant?.owner?.email,
      },
    },
    plan: {
      id: api.plan?.id,
      title: api.plan?.title,
      description: api.plan?.description ?? null,
      price: api.plan?.price,
      duration: api.plan?.duration,
      currency: api.plan?.currency ?? null,
    },
  };
}

export const adminSubscriptionsService = {
  async getAll(
    params: FetchAdminSubscriptionsParams
  ): Promise<AdminSubscriptionsResponse> {
    const response = await axiosInstance.get("/admin/subscriptions", {
      params: {
        search: params.search,
        planId: params.planId,
        status: params.status,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
    const api = response.data;
    const items = (api?.data?.items || []).map(mapSubscription);
    const pagination = api?.data?.pagination || {
      totalItems: items.length,
      totalPages: 1,
      currentPage: 1,
      pageSize: items.length,
    };
    const statistics = api?.data?.statistics || {
      active: 0,
      cancelled: 0,
      expired: 0,
      totalValue: 0,
    };
    return { items, pagination, statistics };
  },

  async cancel(
    id: number | string,
    body: CancelSubscriptionRequest
  ): Promise<AdminSubscription> {
    const response = await axiosInstance.put(
      `/admin/subscriptions/cancel/${id}`,
      body
    );
    return mapSubscription(response.data.data);
  },

  async activate(
    data: ActivateSubscriptionPayload
  ): Promise<AdminSubscription> {
    const response = await axiosInstance.post(
      "/admin/subscriptions/activate",
      data
    );
    return mapSubscription(response.data.data);
  },
};
