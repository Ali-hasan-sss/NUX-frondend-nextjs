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
  /** Points required per food voucher (e.g. 10 = 10 meal points = 1 food voucher) */
  mealPointsPerVoucher: number | null;
  /** Points required per drink voucher (e.g. 5 = 5 drink points = 1 drink voucher) */
  drinkPointsPerVoucher: number | null;
  /** Primary currency code (e.g. EUR, USD) */
  currency: string | null;
}

export interface UpdateRestaurantAccountRequest {
  name?: string;
  logo?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  mealPointsPerVoucher?: number | null;
  drinkPointsPerVoucher?: number | null;
  currency?: string | null;
}

export interface RestaurantAccountState {
  data: RestaurantAccountInfo | null;
  isLoading: boolean;
  error: string | null;
}
