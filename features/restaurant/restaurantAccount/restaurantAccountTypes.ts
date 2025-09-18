export interface RestaurantGroupInfo {
  id: string;
  name: string;
  description: string;
  role: "OWNER" | "MEMBER";
}

export interface RestaurantSubscription {
  id: number;
  restaurantId: string;
  planId: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentId: string | null;
  paymentMethod: string | null;
  transactionRef: string | null;
  createdAt: string;
  updatedAt: string;
  paymentStatus: string | null;
}

export interface RestaurantAccountInfo {
  id: string;
  userId: string;
  name: string;
  logo: string | null;
  address: string;
  latitude: number;
  longitude: number;
  subscriptions: RestaurantSubscription[];
  isGroupMember: boolean;
  qrCode_drink: string | null;
  qrCode_meal: string | null;
  isSubscriptionActive: boolean;
  isActive: boolean;
  createdAt: string;
  group: RestaurantGroupInfo | null;
}

export interface UpdateRestaurantAccountRequest {
  name?: string;
  logo?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface RestaurantAccountState {
  data: RestaurantAccountInfo | null;
  isLoading: boolean;
  error: string | null;
}
