import { axiosInstance } from "@/utils/axiosInstance";

function unwrapData<T>(res: { data: { success?: boolean; data?: T } }): T {
  const body = res.data;
  if (body?.data !== undefined) return body.data as T;
  return body as unknown as T;
}

export interface CompanyListRow {
  id: string;
  name: string;
  taxNumber: string;
  commercialRegister: string;
  subscriptionStatus: string;
  monthlyAllowancePerEmployee: string | number;
  reportedEmployeeCount: number | null;
  createdAt: string;
  _count?: { employees: number };
}

export interface CompanyEmployeeRow {
  id: string;
  userId: string;
  companyId: string;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
    qrCode?: string;
  };
}

export interface CompanyDetail extends CompanyListRow {
  employees: CompanyEmployeeRow[];
  allowanceMonths?: Array<{ yearMonth: string }>;
}

export const companyOwnerApi = {
  listCompanies: async (): Promise<CompanyListRow[]> => {
    const res = await axiosInstance.get("/client/company/");
    const data = unwrapData<{ companies: CompanyListRow[] }>(res);
    return data.companies ?? [];
  },

  getCompany: async (companyId: string): Promise<CompanyDetail> => {
    const res = await axiosInstance.get(`/client/company/${companyId}`);
    const data = unwrapData<{ company: CompanyDetail }>(res);
    return data.company;
  },

  updateCompany: async (
    companyId: string,
    body: Partial<{
      name: string;
      taxNumber: string;
      commercialRegister: string;
      reportedEmployeeCount: number;
      monthlyAllowancePerEmployee: string;
      subscriptionPerEmployeeEur: string;
    }>
  ): Promise<CompanyDetail> => {
    const res = await axiosInstance.put(`/client/company/${companyId}`, body);
    const data = unwrapData<{ company: CompanyDetail }>(res);
    return data.company;
  },

  resolveUserByCode: async (
    companyId: string,
    code: string
  ): Promise<{
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    isActive: boolean;
    qrCode: string;
  }> => {
    const res = await axiosInstance.get(`/client/company/${companyId}/resolve-user`, {
      params: { code: code.trim() },
    });
    const data = unwrapData<{
      user: {
        id: string;
        email: string;
        fullName: string | null;
        role: string;
        isActive: boolean;
        qrCode: string;
      };
    }>(res);
    return data.user;
  },

  addEmployee: async (companyId: string, payload: { userCode?: string; userId?: string }): Promise<void> => {
    await axiosInstance.post(`/client/company/${companyId}/employees`, payload);
  },

  removeEmployee: async (companyId: string, userId: string): Promise<void> => {
    await axiosInstance.delete(`/client/company/${companyId}/employees/${userId}`);
  },

  listAllowanceTransfers: async (
    companyId: string,
    params?: { take?: number; skip?: number; startDate?: string; endDate?: string }
  ): Promise<{
    items: Array<{
      id: string;
      createdAt: string;
      amount: string;
      currency: string;
      employeeUserId: string | null;
      employeeEmail: string | null;
      employeeName: string | null;
      yearMonth: string | null;
      idempotencyKey: string | null;
    }>;
    total: number;
  }> => {
    const res = await axiosInstance.get(`/client/company/${companyId}/allowance-transfers`, {
      params: {
        take: params?.take ?? 100,
        skip: params?.skip ?? 0,
        ...(params?.startDate ? { startDate: params.startDate } : {}),
        ...(params?.endDate ? { endDate: params.endDate } : {}),
      },
    });
    return unwrapData(res);
  },

  /** Opens a CSV download in the browser (uses auth header via axios). */
  downloadAllowanceExport: async (
    companyId: string,
    params: { startDate?: string; endDate?: string }
  ): Promise<void> => {
    const res = await axiosInstance.get(`/client/company/${companyId}/allowance-transfers/export`, {
      params: {
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {}),
      },
      responseType: "blob",
    });
    const cd = (res.headers["content-disposition"] as string | undefined) ?? "";
    const m = /filename="([^"]+)"/.exec(cd);
    const filename = m?.[1] ?? `allowance-export-${companyId}.csv`;
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
