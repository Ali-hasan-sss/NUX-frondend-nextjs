import { AdminUser } from "../users/adminUsersTypes";
import type { AdminSubscription } from "../subscriptions/adminSubscriptionsTypes";

export interface AdminRestaurant {
  id: string;
  name: string;
  logo: string | null;
  address: string;
  latitude: number;
  longitude: number;
  planId?: string | number;
  isSubscriptionActive: boolean;
  createdAt?: string;
  owner: AdminUser & { createdAt?: string };
  subscriptions?: AdminSubscription[];
  currentSubscription?: {
    planName?: string;
    price?: number;
    endDate?: string;
    status?: string;
  } | null;
  isActive: boolean;
}

export interface AdminRestaurantsFilters {
  search?: string;
  planId?: string;
  subscriptionActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateAdminRestaurantRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  userId: string;
  plan: string;
  subscriptionActive: boolean;
}

export interface UpdateAdminRestaurantRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  planId?: string | number;
  subscriptionActive?: boolean;
}
export interface pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
export interface AdminRestaurantsState {
  items: AdminRestaurant[];
  selected: AdminRestaurant | null;
  isLoading: boolean;
  error: string | null;
  pagination: pagination;
}
