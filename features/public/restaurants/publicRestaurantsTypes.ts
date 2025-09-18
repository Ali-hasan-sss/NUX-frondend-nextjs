// Public restaurant types for general use (not admin)

export interface PublicRestaurant {
  id: string;
  name: string;
  logo: string | null;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
}

export interface NearbyRestaurant extends PublicRestaurant {
  distance: number; // Distance in kilometers
}

export interface RestaurantsResponse {
  restaurants: PublicRestaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RestaurantsApiResponse {
  success: boolean;
  message: string;
  data: RestaurantsResponse | PublicRestaurant | NearbyRestaurant[];
}

// Request parameters
export interface GetRestaurantsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetNearbyRestaurantsParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}
