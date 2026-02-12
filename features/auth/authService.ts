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

  async sendVerificationCode(email: string): Promise<void> {
    await axiosInstance.post("/auth/send-verification-code", { email });
  },

  async verifyEmail(email: string, code: string): Promise<void> {
    await axiosInstance.post("/auth/verify-email", { email, code });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await axiosInstance.post("/auth/request-password-reset", { email });
  },

  async resetPassword(
    email: string,
    resetCode: string,
    newPassword: string
  ): Promise<void> {
    await axiosInstance.post("/auth/reset-password", {
      email,
      resetCode,
      newPassword,
    });
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await axiosInstance.post("/auth/google", { idToken });
    const api = response.data;
    return {
      user: { ...api.data.user },
      tokens: api.data.tokens,
    };
  },
};
