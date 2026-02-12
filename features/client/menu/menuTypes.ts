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
}

export interface MenuItemsApiResponse {
  success: boolean;
  message?: string;
  data: MenuItem[];
}
