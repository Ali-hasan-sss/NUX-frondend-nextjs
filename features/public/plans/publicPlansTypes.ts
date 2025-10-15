// Types for public plans feature
export interface PublicPlanPermission {
  id: number;
  type: string;
  value: number | null;
  isUnlimited: boolean;
}

export interface PublicPlan {
  id: number;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number;
  isActive: boolean;
  permissions: PublicPlanPermission[];
}

export interface PublicPlansApiResponse {
  success: boolean;
  message: string;
  data: PublicPlan[] | PublicPlan;
}

export interface PublicPlansState {
  plans: PublicPlan[];
  selectedPlan: PublicPlan | null;
  loading: {
    plans: boolean;
    selectedPlan: boolean;
  };
  error: {
    plans: string | null;
    selectedPlan: string | null;
  };
}
