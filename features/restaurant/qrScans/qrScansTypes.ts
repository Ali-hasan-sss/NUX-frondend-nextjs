// QR Scans Types
export interface QRScanUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface QRScan {
  id: number;
  userId: string;
  restaurantId: string;
  type: "drink" | "meal";
  qrCode: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  user: QRScanUser;
}

export interface QRScanPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QRScansResponse {
  scans: QRScan[];
  pagination: QRScanPagination;
}

export interface QRScanStats {
  totalScans: number;
  drinkScans: number;
  mealScans: number;
  uniqueUsers: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
}

export interface FetchQRScansParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: "drink" | "meal";
}

export interface FetchQRScanStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface QRScansState {
  scans: QRScan[];
  pagination: QRScanPagination | null;
  stats: QRScanStats | null;
  isLoading: boolean;
  error: string | null;
}
