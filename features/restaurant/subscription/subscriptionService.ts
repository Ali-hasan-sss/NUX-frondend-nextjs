import { axiosInstance } from "@/utils/axiosInstance";

type CheckoutResponse = { url: string; id: string };

export const subscriptionService = {
  async createCheckout(
    planId: number,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<CheckoutResponse> {
    const res = await axiosInstance.post("/restaurants/subscription/checkout", {
      planId,
      successUrl,
      cancelUrl,
    });
    return res.data?.data as CheckoutResponse;
  },

  async confirm(sessionId: string): Promise<{ subscriptionId?: string }> {
    const res = await axiosInstance.post("/restaurants/subscription/confirm", {
      sessionId,
    });
    return res.data?.data ?? {};
  },
};
