export interface PlanPermission {
  id: number;
  type: string;
  value: number | null;
  isUnlimited: boolean;
}

export interface AdminPlan {
  id: number | string;
  title: string;
  description?: string | null;
  currency?: string | null;
  subscriberCount: number;
  price: number;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  duration: number; // days
  displayOrder: number;
  isActive: boolean;
  permissions: PlanPermission[];
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  stripeMonthlyPriceId?: string | null;
  stripeAnnualPriceId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPlansState {
  items: AdminPlan[];
  selected: AdminPlan | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateAdminPlanRequest {
  title: string;
  description?: string | null;
  currency?: string | null;
  price: number;
  monthlyPrice?: number;
  annualPrice?: number;
  duration: number;
  displayOrder?: number;
  isActive?: boolean;
  permissions?: PlanPermission[];
}

export interface UpdateAdminPlanRequest {
  title?: string;
  description?: string | null;
  currency?: string | null;
  price?: number;
  monthlyPrice?: number;
  annualPrice?: number;
  duration?: number;
  displayOrder?: number;
  isActive?: boolean;
  permissions?: PlanPermission[];
}
