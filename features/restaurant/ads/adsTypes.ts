export interface RestaurantAd {
  id: number;
  restaurantId: string;
  title: string;
  description?: string | null;
  image: string;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdPayload {
  title: string;
  description?: string;
  image: string;
  category?: string;
}

export interface UpdateAdPayload {
  id: number;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
}

export interface RestaurantAdsState {
  items: RestaurantAd[];
  selected: RestaurantAd | null;
  isLoading: boolean;
  error: string | null;
}
