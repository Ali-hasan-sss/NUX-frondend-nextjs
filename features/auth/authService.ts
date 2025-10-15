import { axiosInstance } from "@/utils/axiosInstance";
import type {
  LoginRequest,
  RegisterRestaurantRequest,
  RegisterUserRequest,
  AuthResponse,
} from "./authTypes";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post("/auth/login", credentials);
    const api = response.data;
    return {
      user: { ...api.data.user },
      tokens: api.data.tokens,
    };
  },

  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post("/auth/admin/login", credentials);
    const api = response.data;

    return {
      user: { ...api.data.user },
      tokens: api.data.tokens,
    };
  },

  async registerRestaurant(
    restaurantData: RegisterRestaurantRequest
  ): Promise<AuthResponse> {
    const response = await axiosInstance.post(
      "/auth/registerRestaurant",
      restaurantData
    );
    const api = response.data;
    return {
      user: { ...api.data.user },
      tokens: api.data.tokens,
    };
  },

  async registerUser(userData: RegisterUserRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post("/auth/register", userData);
    const api = response.data;
    return {
      user: { ...api.data.user },
      tokens: api.data.tokens,
    };
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await axiosInstance.post("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },
};
