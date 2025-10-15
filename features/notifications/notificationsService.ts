import { axiosInstance } from "@/utils/axiosInstance";
import type {
  FetchNotificationsParams,
  NotificationsResponse,
  NotificationItem,
} from "./notificationsTypes";

function mapNotification(api: any): NotificationItem {
  return {
    id: api.id,
    title: api.title,
    body: api.body,
    type: api.type,
    createdAt: api.createdAt,
    isRead: Boolean(api.isRead),
  };
}

export const notificationsService = {
  // Fetch paginated notifications
  async getAll(
    params: FetchNotificationsParams
  ): Promise<NotificationsResponse> {
    const response = await axiosInstance.get("/notifications", { params });
    const api = response.data;
    // Support both shapes: { data: { notifications, pagination } } and { data: Notification[] }
    const list = Array.isArray(api?.data)
      ? api.data
      : api?.data?.notifications || [];
    const notifications = list.map(mapNotification);
    const pagination = api?.data?.pagination || {
      totalItems: notifications.length,
      totalPages: 1,
      currentPage: params.page ?? 1,
      pageSize: params.pageSize ?? notifications.length,
    };
    return { notifications, pagination };
  },

  // Mark single notification as read
  async markRead(id: number | string): Promise<NotificationItem> {
    const response = await axiosInstance.put(`/notifications/read/${id}`);
    return mapNotification(response.data?.data);
  },

  // Mark all notifications as read
  async markAllRead(): Promise<void> {
    await axiosInstance.put("/notifications/read-all");
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await axiosInstance.get("/notifications/count");
    // Support both shapes: { data: number } and { data: { count: number } }
    const raw = response.data?.data;
    if (typeof raw === "number") return raw;
    if (raw && typeof raw.count === "number") return raw.count;
    return 0;
  },
};
