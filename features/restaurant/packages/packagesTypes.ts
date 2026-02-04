export interface RestaurantPackage {
  id: number;
  restaurantId: string;
  name: string;
  amount: number;
  bonus: number;
  currency: string;
  description?: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackagePayload {
  name: string;
  amount: number;
  bonus?: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdatePackagePayload {
  id: number;
  name?: string;
  amount?: number;
  bonus?: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface RestaurantPackagesState {
  items: RestaurantPackage[];
  selected: RestaurantPackage | null;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
}
