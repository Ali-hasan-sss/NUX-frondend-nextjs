export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "RESTAURANT_OWNER" | "USER" | "SUBADMIN";
  restaurantName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRestaurantRequest {
  email: string;
  password: string;
  fullName: string;
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  logo?: string;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
