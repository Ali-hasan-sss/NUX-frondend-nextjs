// Restaurant Overview Types
export interface RestaurantInfo {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  isSubscriptionActive: boolean;
  createdAt: string;
}

export interface RestaurantOverviewStats {
  totalQRScans: number;
  thisMonthScans: number;
  scanGrowthPercentage: number;
  loyaltyPointsIssued: number;
  groupMembers: number;
  monthlyRevenue: number;
  revenueGrowthPercentage: number;
  activeCustomers: number;
  averageRating: number;
}

export interface RecentActivity {
  id: string;
  type: "qr_scan" | "group_invite" | "payment" | "customer";
  message: string;
  time: string;
  points?: number;
  amount?: number;
  createdAt: string;
}

export interface RestaurantOverviewResponse {
  restaurant: RestaurantInfo;
  stats: RestaurantOverviewStats;
  recentActivities: RecentActivity[];
}

export interface RestaurantOverviewState {
  restaurant: RestaurantInfo | null;
  stats: RestaurantOverviewStats | null;
  recentActivities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
}
