import { axiosInstance } from "@/utils/axiosInstance";
import type {
  AdminUser,
  AdminOwnedCompany,
  AdminUserDetail,
  AdminUsersFilters,
  CreateAdminUserRequest,
  CreateCompanyOwnerRequest,
  UpdateAdminUserRequest,
} from "./adminUsersTypes";

function mapCompany(c: Record<string, unknown>): AdminOwnedCompany {
  return {
    id: String(c.id),
    name: String(c.name ?? ""),
    taxNumber: c.taxNumber != null ? String(c.taxNumber) : undefined,
    commercialRegister:
      c.commercialRegister != null ? String(c.commercialRegister) : undefined,
    reportedEmployeeCount:
      typeof c.reportedEmployeeCount === "number"
        ? c.reportedEmployeeCount
        : c.reportedEmployeeCount != null
          ? Number(c.reportedEmployeeCount)
          : undefined,
    subscriptionStatus:
      c.subscriptionStatus != null ? String(c.subscriptionStatus) : undefined,
    monthlyAllowancePerEmployee:
      c.monthlyAllowancePerEmployee != null
        ? String(c.monthlyAllowancePerEmployee)
        : undefined,
    subscriptionPerEmployeeEur:
      c.subscriptionPerEmployeeEur != null
        ? String(c.subscriptionPerEmployeeEur)
        : undefined,
    createdAt: c.createdAt != null ? String(c.createdAt) : undefined,
  };
}

function mapUser(apiUser: any): AdminUser {
  const companiesOwned = Array.isArray(apiUser.companiesOwned)
    ? (apiUser.companiesOwned as Record<string, unknown>[]).map(mapCompany)
    : undefined;
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.fullName,
    role: apiUser.role,
    isActive: Boolean(apiUser.isActive),
    isRestaurant: Boolean(apiUser.isRestaurant),
    createdAt: apiUser.createdAt,
    ...(companiesOwned !== undefined ? { companiesOwned } : {}),
  };
}

export const adminUsersService = {
  async getAll(
    filters: AdminUsersFilters = { pageNumber: 1, pageSize: 10 },
  ): Promise<{
    users: AdminUser[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }> {
    const params: Record<string, string | number | boolean> = {
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    };
    if (filters.role) params.role = filters.role;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.email) params.email = filters.email;
    if (filters.hasCompany !== undefined) {
      params.hasCompany = filters.hasCompany ? "true" : "false";
    }
    if (filters.includeCompanies) {
      params.includeCompanies = "true";
    }

    const response = await axiosInstance.get("/admin/users", {
      params,
    });
    const api = response.data;

    const list = Array.isArray(api.data?.users) ? api.data.users : [];
    return {
      users: list.map(mapUser),
      pagination: api.data?.pagination || {
        totalItems: list.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: list.length,
      },
    };
  },

  async getById(id: string): Promise<AdminUser> {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    const api = response.data;
    return mapUser(api.data);
  },

  async getDetailById(id: string): Promise<AdminUserDetail> {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    const api = response.data;
    const d = api.data;
    const companiesOwned = Array.isArray(d.companiesOwned)
      ? (d.companiesOwned as Record<string, unknown>[]).map(mapCompany)
      : undefined;
    return {
      id: d.id,
      email: d.email,
      fullName: d.fullName ?? null,
      role: d.role,
      isActive: Boolean(d.isActive),
      isRestaurant: Boolean(d.isRestaurant),
      createdAt: d.createdAt,
      restaurants: Array.isArray(d.restaurants) ? d.restaurants : [],
      balances: Array.isArray(d.balances) ? d.balances : [],
      ...(companiesOwned !== undefined ? { companiesOwned } : {}),
    };
  },

  async createCompanyOwnerWithCompany(
    payload: CreateCompanyOwnerRequest,
  ): Promise<AdminUser> {
    const response = await axiosInstance.post("/admin/users/company-owner", payload);
    const d = response.data?.data;
    const company = d?.company;
    const mappedCompany =
      company && typeof company === "object"
        ? [
            mapCompany({
              ...company,
              id: company.id,
              name: company.name,
            } as Record<string, unknown>),
          ]
        : [];
    return mapUser({
      ...d.user,
      companiesOwned: mappedCompany,
    });
  },

  async createUser(payload: CreateAdminUserRequest): Promise<AdminUser> {
    const response = await axiosInstance.post("/admin/users", {
      ...payload,
      role: payload.role,
    });
    const api = response.data;
    return mapUser(api.data);
  },

  async updateUser(
    id: string,
    payload: UpdateAdminUserRequest
  ): Promise<AdminUser> {
    const response = await axiosInstance.put(`/admin/users/${id}`, {
      ...payload,
      role: payload.role ? payload.role : undefined,
    });
    const api = response.data;
    return mapUser(api.data);
  },

  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/users/${id}`);
  },
};
