import { axiosInstance } from "@/utils/axiosInstance";

export type AdminNotificationAudience =
  | "all"
  | "restaurant_owners"
  | "subadmins";

export interface SendAdminNotificationPayload {
  title: string;
  body: string;
  audience: AdminNotificationAudience;
}

export interface SendAdminNotificationResponse {
  count: number;
}

export const adminNotificationsService = {
  async send(
    payload: SendAdminNotificationPayload
  ): Promise<SendAdminNotificationResponse> {
    const response = await axiosInstance.post(
      "/admin/notifications/send",
      payload
    );
    const data = response.data?.data ?? response.data;
    return {
      count: data?.count ?? 0,
    };
  },
};
