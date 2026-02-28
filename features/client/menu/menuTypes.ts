export interface MenuCategory {
  id: number;
  title: string; // Changed from name to title to match backend schema
  description?: string;
  image?: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: number;
  title: string; // Changed from name to title to match backend schema
  description?: string;
  price: number;
  image?: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category?: MenuCategory;
}

export interface MenuState {
  categories: MenuCategory[];
  items: MenuItem[];
  selectedCategory: MenuCategory | null;
  currentRestaurantId: string | null;
  restaurant: MenuRestaurantInfo | null;
  /** Restaurant currency code from API (e.g. TRY, USD, EUR). */
  currency: string | null;
  loading: {
    categories: boolean;
    items: boolean;
  };
  error: {
    categories: string | null;
    items: string | null;
  };
}

export interface MenuRestaurantInfo {
  name: string | null;
  logo: string | null;
}

export interface MenuCategoriesApiResponse {
  success: boolean;
  message?: string;
  data: MenuCategory[];
  restaurant?: MenuRestaurantInfo;
  currency?: string;
}

export interface MenuItemsApiResponse {
  success: boolean;
  message?: string;
  data: MenuItem[];
  currency?: string;
}
