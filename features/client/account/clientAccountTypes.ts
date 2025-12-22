export interface ClientProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  qrCode?: string;
}

export interface ClientAccountState {
  profile: ClientProfile | null;
  loading: {
    profile: boolean;
    updateProfile: boolean;
    changePassword: boolean;
    deleteAccount: boolean;
  };
  error: {
    profile: string | null;
    updateProfile: string | null;
    changePassword: string | null;
    deleteAccount: string | null;
  };
}

export interface UpdateClientProfileRequest {
  fullName?: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface ClientProfileApiResponse {
  success: boolean;
  message: string;
  data: ClientProfile;
}

export interface ClientAccountApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
