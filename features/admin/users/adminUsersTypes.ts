export interface AdminOwnedCompany {
  id: string;
  name: string;
  taxNumber?: string;
  commercialRegister?: string;
  reportedEmployeeCount?: number;
  subscriptionStatus?: string;
  monthlyAllowancePerEmployee?: string;
  subscriptionPerEmployeeEur?: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "RESTAURANT_OWNER" | "COMPANY_OWNER" | "ADMIN" | "SUBADMIN";
  isActive: boolean;
  isRestaurant?: boolean;
  createdAt?: string;
  companiesOwned?: AdminOwnedCompany[];
}

/** Full payload from GET /admin/users/:id (profile + restaurants + balances). */
export interface AdminUserDetail {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  isRestaurant: boolean;
  createdAt?: string;
  restaurants: Array<{
    id: string;
    name: string;
    balances?: unknown[];
  }>;
  balances: unknown[];
  companiesOwned?: AdminOwnedCompany[];
}

export interface AdminUsersFilters {
  isActive?: boolean;
  email?: string;
  role?: "ADMIN" | "RESTAURANT_OWNER" | "COMPANY_OWNER" | "USER" | "SUBADMIN";
  /** Backend expects string true/false; set via service from boolean. */
  hasCompany?: boolean;
  includeCompanies?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface CreateAdminUserRequest {
  email: string;
  password?: string;
  fullName: string;
  role: "ADMIN" | "RESTAURANT_OWNER" | "COMPANY_OWNER" | "USER" | "SUBADMIN";
  isActive: boolean;
}

export interface CreateCompanyOwnerRequest {
  email: string;
  password: string;
  fullName?: string;
  isActive?: boolean;
  company: {
    name: string;
    taxNumber: string;
    commercialRegister: string;
    employeeCount: number;
    monthlyAllowancePerEmployee?: string;
    subscriptionPerEmployeeEur?: string;
  };
}

export interface UpdateAdminUserRequest {
  email?: string;
  password?: string;
  fullName?: string;
  isActive?: boolean;
  role?: "ADMIN" | "RESTAURANT_OWNER" | "COMPANY_OWNER" | "USER" | "SUBADMIN";
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
