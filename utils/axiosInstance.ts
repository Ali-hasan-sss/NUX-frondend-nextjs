import axios from "axios";
import { setTokens, logout } from "@/features/auth/authSlice";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

let reduxStore: {
  getState: () => any;
  dispatch: (action: any) => void;
} | null = null;

export const attachStoreToAxios = (store: {
  getState: () => any;
  dispatch: (action: any) => void;
}) => {
  reduxStore = store;
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = reduxStore?.getState();
    const token = state?.auth?.tokens?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const state = reduxStore?.getState();
      const refreshToken = state?.auth?.tokens?.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
            }/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          reduxStore?.dispatch(
            setTokens({ accessToken, refreshToken: newRefreshToken })
          );

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          reduxStore?.dispatch(logout());
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
      } else {
        reduxStore?.dispatch(logout());
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
