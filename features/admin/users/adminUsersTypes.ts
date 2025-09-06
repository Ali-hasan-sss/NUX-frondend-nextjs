export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "RESTAURANT_OWNER" | "ADMIN";
  isActive: boolean;
  isRestaurant?: boolean;
  createdAt?: string;
}

export interface AdminUsersFilters {
  isActive?: boolean;
  email?: string;
  role?: "ADMIN" | "RESTAURANT_OWNER" | "USER";
  pageNumber: number;
  pageSize: number;
}

export interface CreateAdminUserRequest {
  email: string;
  password?: string;
  fullName: string;
  role: "ADMIN" | "RESTAURANT_OWNER" | "USER";
  isActive: boolean;
}

export interface UpdateAdminUserRequest {
  email?: string;
  password?: string;
  fullName?: string;
  isActive?: boolean;
  role?: "ADMIN" | "RESTAURANT_OWNER" | "USER";
}

export interface AdminUsersState {
  items: AdminUser[];
  selectedUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const initialState: AdminUsersState = {
  items: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  },
};
