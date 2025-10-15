export interface NotificationItem {
  id: number | string;
  title: string;
  body: String;
  type: String;
  createdAt: string;
  isRead?: boolean;
}

export interface NotificationsPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface FetchNotificationsParams {
  page?: number;
  pageSize?: number;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: NotificationsPagination;
}

export interface NotificationsState {
  items: NotificationItem[];
  pagination: NotificationsPagination;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}
