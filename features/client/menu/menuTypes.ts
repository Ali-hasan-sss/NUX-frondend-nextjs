export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive: boolean;
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
  loading: {
    categories: boolean;
    items: boolean;
  };
  error: {
    categories: string | null;
    items: string | null;
  };
}

export interface MenuCategoriesApiResponse {
  success: boolean;
  message?: string;
  data: MenuCategory[];
}

export interface MenuItemsApiResponse {
  success: boolean;
  message?: string;
  data: MenuItem[];
}
