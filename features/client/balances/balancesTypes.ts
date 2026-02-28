export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  groupMemberships?: GroupMembership[];
  ownedGroups?: Group[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface GroupMembership {
  id: string;
  group: Group;
}

export interface UserRestaurantBalance {
  id?: string;
  targetId?: string;
  userId?: string;
  restaurantId?: string;
  name?: string;
  balance: number;
  stars_meal: number;
  stars_drink: number;
  isGroup?: boolean;
  /** Restaurant setting: points per food voucher */
  mealPointsPerVoucher?: number | null;
  /** Restaurant setting: points per drink voucher */
  drinkPointsPerVoucher?: number | null;
  /** Computed: meal points ÷ mealPointsPerVoucher (when set) */
  vouchers_meal?: number | null;
  /** Computed: drink points ÷ drinkPointsPerVoucher (when set) */
  vouchers_drink?: number | null;
  createdAt?: string;
  updatedAt?: string;
  restaurant?: Restaurant;
}

export interface Package {
  id: number;
  title: string;
  description?: string;
  price: number;
  currency: string;
  stars_meal: number;
  stars_drink: number;
  balance: number;
  duration: number;
  isActive: boolean;
  isPublic: boolean;
  restaurantId: string;
  restaurant: Restaurant;
  createdAt: string;
}

export interface QrScanData {
  qrCode: string;
  latitude: number;
  longitude: number;
}

export interface PaymentData {
  targetId: string;
  currencyType: "balance" | "stars_meal" | "stars_drink";
  amount: number;
}

export interface GiftData {
  targetId: string;
  qrCode: string;
  currencyType: "balance" | "stars_meal" | "stars_drink";
  amount: number;
}

export interface BalancesState {
  userBalances: UserRestaurantBalance[];
  packages: Package[];
  loading: {
    balances: boolean;
    packages: boolean;
    qrScan: boolean;
    payment: boolean;
    gift: boolean;
  };
  error: {
    balances: string | null;
    packages: string | null;
    qrScan: string | null;
    payment: string | null;
    gift: string | null;
  };
}

export interface BalancesApiResponse {
  success: boolean;
  message: string;
  data: UserRestaurantBalance[];
}

export interface PackagesApiResponse {
  success: boolean;
  message: string;
  data: Package[];
}

export interface QrScanApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface PaymentApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
