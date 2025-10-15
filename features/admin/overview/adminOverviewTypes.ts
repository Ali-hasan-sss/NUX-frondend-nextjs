export interface AdminOverviewStats {
  totalUsers: number;
  totalRestaurants: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  newSignupsThisWeek: number;
  newRestaurantsThisWeek: number;
  subscriptionHealth: number;
}

export interface RecentActivity {
  id: string;
  type: "subscription" | "restaurant" | "invoice" | "user";
  message: string;
  time: string;
  status: "success" | "warning" | "info" | "error";
  createdAt: string;
}

export interface AdminOverviewResponse {
  stats: AdminOverviewStats;
  recentActivities: RecentActivity[];
}

export interface AdminOverviewState {
  stats: AdminOverviewStats | null;
  recentActivities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
}
