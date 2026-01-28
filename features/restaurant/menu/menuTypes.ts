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
  kitchenSectionId?: number | null;
  title: string;
  description: string | null;
  price: number;
  image?: string | null;
  preparationTime?: number | null;
  extras?: Array<{ name: string; price: number; calories: number }> | null;
  discountType?: "PERCENTAGE" | "AMOUNT" | null;
  discountValue?: number | null;
  allergies?: string[];
  calories?: number | null;
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
  preparationTime?: number;
  extras?: Array<{ name: string; price: number; calories: number }>;
  discountType?: "PERCENTAGE" | "AMOUNT";
  discountValue?: number;
  allergies?: string[];
  calories?: number;
  kitchenSectionId?: number;
}

export interface UpdateItemPayload {
  itemId: number;
  title?: string;
  description?: string;
  price?: number;
  image?: string;
  preparationTime?: number | null;
  extras?: Array<{ name: string; price: number; calories: number }> | null;
  discountType?: "PERCENTAGE" | "AMOUNT" | null;
  discountValue?: number | null;
  allergies?: string[];
  calories?: number | null;
  kitchenSectionId?: number | null;
}

export interface RestaurantMenuState {
  categories: MenuCategory[];
  itemsByCategory: Record<number, MenuItem[]>;
  isLoading: boolean;
  error: string | null;
}
