import { axiosInstance } from "@/utils/axiosInstance";

type CheckoutResponse = { url: string; id: string };

export type CheckoutProvider = "stripe" | "paypal";

export const subscriptionService = {
  async createCheckout(
    planId: number,
    options?: {
      provider?: CheckoutProvider;
      successUrl?: string;
      cancelUrl?: string;
    }
  ): Promise<CheckoutResponse> {
    const res = await axiosInstance.post("/restaurants/subscription/checkout", {
      planId,
      provider: options?.provider ?? "stripe",
      successUrl: options?.successUrl,
      cancelUrl: options?.cancelUrl,
    });
    return res.data?.data as CheckoutResponse;
  },

  async confirm(sessionId: string): Promise<{ subscriptionId?: string }> {
    const res = await axiosInstance.post("/restaurants/subscription/confirm", {
      sessionId,
    });
    return res.data?.data ?? {};
  },

  async confirmPayPal(orderId: string): Promise<{ subscriptionId?: string }> {
    const res = await axiosInstance.post(
      "/restaurants/subscription/confirm-paypal",
      { orderId }
    );
    return res.data?.data ?? {};
  },
};
