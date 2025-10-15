export interface MenuCategory {
  id: number;
  restaurantId: string;
  title: string;
  description: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  title: string;
  description: string | null;
  price: number;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  title: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryPayload {
  categoryId: number;
  title?: string;
  description?: string;
  image?: string;
}

export interface CreateItemPayload {
  categoryId: number;
  title: string;
  description?: string;
  price: number;
  image?: string;
}

export interface UpdateItemPayload {
  itemId: number;
  title?: string;
  description?: string;
  price?: number;
  image?: string;
}

export interface RestaurantMenuState {
  categories: MenuCategory[];
  itemsByCategory: Record<number, MenuItem[]>;
  isLoading: boolean;
  error: string | null;
}
