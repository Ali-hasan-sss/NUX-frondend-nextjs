"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Check,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CheckoutProvider } from "@/features/restaurant/subscription/subscriptionService";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { fetchPublicPlans } from "@/features/public/plans/publicPlansThunks";
import { subscriptionService } from "@/features/restaurant/subscription/subscriptionService";
import { fetchRestaurantAccount } from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
import { useTranslation } from "react-i18next";

export function SubscriptionManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  /** Plan ID whose subscribe/upgrade button is currently loading (loader only on that button) */
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );
  /** true = success (green), false = error (red). Used for styling regardless of language. */
  const [confirmationIsSuccess, setConfirmationIsSuccess] = useState<
    boolean | null
  >(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<number, boolean>
  >({});
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [paymentMethodPlanId, setPaymentMethodPlanId] = useState<number | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const {
    plans,
    loading,
    error: plansError,
  } = useAppSelector((state) => state.publicPlans);
  const { data: restaurantAccount } = useAppSelector(
    (state) => state.restaurantAccount
  );

  // Load plans and restaurant account on component mount
  useEffect(() => {
    dispatch(fetchPublicPlans());
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  // Check for successful payment and confirm subscription (Stripe or PayPal)
  useEffect(() => {
    const status = searchParams.get("status");
    const provider = searchParams.get("provider");
    const sessionId = searchParams.get("session_id");
    const token = searchParams.get("token"); // PayPal order ID

    if (status !== "success") return;

    if (provider === "paypal" && token) {
      confirmPayPalSubscription(token);
    } else if (sessionId) {
      confirmSubscription(sessionId);
    }
  }, [searchParams]);

  const confirmSubscription = async (sessionId: string) => {
    setIsConfirming(true);
    setConfirmationMessage(null);
    setConfirmationIsSuccess(null);

    try {
      const result = await subscriptionService.confirm(sessionId);

      if (result.subscriptionId) {
        setConfirmationMessage(
          t("dashboard.subscription.subscriptionConfirmed")
        );
        setConfirmationIsSuccess(true);
        dispatch(fetchRestaurantAccount());
        dispatch(fetchPublicPlans());
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        url.searchParams.delete("status");
        url.searchParams.delete("provider");
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      } else {
        setConfirmationMessage(t("dashboard.subscription.confirmationFailed"));
        setConfirmationIsSuccess(false);
      }
    } catch (error) {
      console.error("Error confirming subscription:", error);
      setConfirmationMessage(t("dashboard.subscription.errorConfirming"));
      setConfirmationIsSuccess(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const confirmPayPalSubscription = async (orderId: string) => {
    setIsConfirming(true);
    setConfirmationMessage(null);
    setConfirmationIsSuccess(null);

    try {
      const result = await subscriptionService.confirmPayPal(orderId);

      if (result.subscriptionId) {
        setConfirmationMessage(
          t("dashboard.subscription.subscriptionConfirmed")
        );
        setConfirmationIsSuccess(true);
        dispatch(fetchRestaurantAccount());
        dispatch(fetchPublicPlans());
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        url.searchParams.delete("status");
        url.searchParams.delete("provider");
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      } else {
        setConfirmationMessage(t("dashboard.subscription.confirmationFailed"));
        setConfirmationIsSuccess(false);
      }
    } catch (error) {
      console.error("Error confirming PayPal subscription:", error);
      setConfirmationMessage(t("dashboard.subscription.errorConfirming"));
      setConfirmationIsSuccess(false);
    } finally {
      setIsConfirming(false);
    }
  };

  // const handlePlanSelect = (planId: number) => {
  //   setSelectedPlan(planId);
  // };

  const openPaymentMethodDialog = (planId: number) => {
    const isRenewal = isPlanSubscribed(planId);
    if (isRenewal && !isInLastMonth()) {
      alert(t("dashboard.subscription.renewalAvailable"));
      return;
    }
    setPaymentMethodPlanId(planId);
    setPaymentMethodDialogOpen(true);
  };

  const handleSubscribeWithProvider = async (provider: CheckoutProvider) => {
    if (paymentMethodPlanId == null) return;
    const planId = paymentMethodPlanId;
    setLoadingPlanId(planId);
    setPaymentMethodDialogOpen(false);
    setPaymentMethodPlanId(null);

    try {
      const response = await subscriptionService.createCheckout(planId, {
        provider,
      });
      if (response?.url) {
        window.location.href = response.url;
        return;
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      const message =
        error?.response?.data?.message || error?.message || "";
      const isRenewalTooEarly =
        typeof message === "string" &&
        message.toLowerCase().includes("renewal is only available");
      if (isRenewalTooEarly) {
        const match = message.match(/you can renew in (\d+) days/i);
        const days = match ? match[1] : "0";
        toast.error(
          t("dashboard.subscription.renewalOnlyInLast30Days", { days })
        );
      } else {
        toast.error(
          message || t("dashboard.subscription.errorCreatingCheckout")
        );
      }
    }
    setLoadingPlanId(null);
  };

  const handleCancelSubscription = () => {
    // In real app, this would show a confirmation dialog and cancel the subscription
    console.log("Cancel subscription");
  };

  // Current subscription = active only (ignore CANCELLED/expired); among active, pick highest price plan
  const activeSubscriptions =
    restaurantAccount?.subscriptions?.filter((s) => s.status === "ACTIVE") ??
    [];
  const currentSubscription =
    activeSubscriptions.length > 0
      ? activeSubscriptions.reduce((highest, current) => {
          const currentPlanObj = plans.find(
            (plan) => plan.id === current.planId
          );
          const highestPlanObj = plans.find(
            (plan) => plan.id === highest.planId
          );
          const currentPrice = currentPlanObj?.price ?? 0;
          const highestPrice = highestPlanObj?.price ?? 0;
          return currentPrice > highestPrice ? current : highest;
        })
      : null;

  const currentPlan = currentSubscription
    ? plans.find((plan) => plan.id === currentSubscription.planId)
    : null;

  const formatPrice = (
    price: number | null | undefined,
    currency: string | null | undefined
  ) => {
    if (!price || price <= 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "EUR").toUpperCase(),
    }).format(price);
  };

  const formatDuration = (duration: number | null | undefined) => {
    // Duration is in days, convert to appropriate format
    if (!duration || duration <= 0) return "N/A";
    if (duration === 1) return "day";
    if (duration < 7) return `${duration} days`;
    if (duration < 30) {
      const weeks = Math.floor(duration / 7);
      const remainingDays = duration % 7;
      if (remainingDays === 0) return `${weeks} week${weeks > 1 ? "s" : ""}`;
      return `${weeks} week${weeks > 1 ? "s" : ""} ${remainingDays} day${
        remainingDays > 1 ? "s" : ""
      }`;
    }
    if (duration < 365) {
      const months = Math.floor(duration / 30);
      const remainingDays = duration % 30;
      if (remainingDays === 0) return `${months} month${months > 1 ? "s" : ""}`;
      return `${months} month${months > 1 ? "s" : ""} ${remainingDays} day${
        remainingDays > 1 ? "s" : ""
      }`;
    }
    const years = Math.floor(duration / 365);
    const remainingDays = duration % 365;
    if (remainingDays === 0) return `${years} year${years > 1 ? "s" : ""}`;
    const months = Math.floor(remainingDays / 30);
    const finalDays = remainingDays % 30;
    let result = `${years} year${years > 1 ? "s" : ""}`;
    if (months > 0) result += ` ${months} month${months > 1 ? "s" : ""}`;
    if (finalDays > 0) result += ` ${finalDays} day${finalDays > 1 ? "s" : ""}`;
    return result;
  };

  const isUpgrade = (planPrice: number | null | undefined) =>
    (planPrice || 0) > (currentPlan?.price || 0);
  const isDowngrade = (planPrice: number | null | undefined) =>
    (planPrice || 0) < (currentPlan?.price || 0);

  // Check if plan is free
  const isFreePlan = (planPrice: number | null | undefined) =>
    !planPrice || planPrice <= 0;

  // Check if current subscription is in last month (30 days)
  const isInLastMonth = () => {
    if (!currentSubscription?.endDate) return false;
    const endDate = new Date(currentSubscription.endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30;
  };

  // Check if plan is already subscribed
  const isPlanSubscribed = (planId: number) => {
    return restaurantAccount?.subscriptions?.some(
      (sub) => sub.planId === planId && sub.status === "ACTIVE"
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("dashboard.subscription.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.subscription.description")}
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("dashboard.subscription.currentSubscription")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.subscription.activeSubscriptionDetails")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.subscription.currentPlan")}
                  </p>
                  <p className="text-lg font-bold">
                    {currentPlan?.title || "Unknown Plan"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("dashboard.subscription.status")}
                  </p>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-900">
                    {currentSubscription.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Next Billing
                  </p>
                  <p className="text-lg font-bold">
                    {currentSubscription.endDate
                      ? new Date(
                          currentSubscription.endDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cost
                  </p>
                  <p className="text-lg font-bold">
                    {currentPlan
                      ? formatPrice(
                          currentPlan.price || 0,
                          currentPlan.currency || "EUR"
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("dashboard.subscription.paymentMethodLabel")}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentSubscription.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.subscription.selectPlan")}</CardTitle>
            <CardDescription>
              {t("dashboard.subscription.chooseSubscriptionPlan")}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Subscription Confirmation Alert */}
      {isConfirming && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Confirming your subscription...</AlertDescription>
        </Alert>
      )}

      {confirmationMessage && (
        <Alert
          className={
            confirmationIsSuccess === true
              ? "border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-400"
              : "border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400"
          }
        >
          {confirmationIsSuccess === true ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <AlertDescription
            className={
              confirmationIsSuccess === true
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {confirmationMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Change Alert */}
      {selectedPlan && currentSubscription && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-400">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            You have selected a new plan. Changes will take effect at your next
            billing cycle on{" "}
            {new Date(currentSubscription.endDate).toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      )}

      {/* Available Plans */}
      <div className="overflow-visible">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {t("dashboard.subscription.availablePlans")}
        </h2>

        {loading.plans ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">
              {t("dashboard.subscription.loadingPlans")}
            </span>
          </div>
        ) : plansError?.plans ? (
          <div className="text-center p-8">
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {t("dashboard.subscription.errorLoadingPlans")}:{" "}
                {plansError.plans || "Unknown error"}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => dispatch(fetchPublicPlans())}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 overflow-visible">
            {plans.map((plan) => {
              const isCurrent = currentPlan?.id === plan.id;
              const isSelected = selectedPlan === plan.id;
              const isExpanded = expandedDescriptions[plan.id] || false;
              const descriptionText =
                plan.description?.replace(/<[^>]*>/g, "") || "";
              const shouldShowReadMore = descriptionText.length > 150;
              const displayDescription =
                isExpanded || !shouldShowReadMore
                  ? plan.description || "No description available"
                  : descriptionText.substring(0, 150) + "...";

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col h-full overflow-visible ${
                    plan.title.toLowerCase().includes("premium") ||
                    plan.title.toLowerCase().includes("pro")
                      ? "border-primary shadow-lg"
                      : isCurrent
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20 dark:border-green-400"
                      : isSelected
                      ? "border-secondary shadow-md"
                      : "border-border"
                  }`}
                >
                  {(plan.title.toLowerCase().includes("premium") ||
                    plan.title.toLowerCase().includes("pro")) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        {t("dashboard.subscription.mostPopular")}
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-block bg-green-600 dark:bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
                        {t("dashboard.subscription.currentPlan")}
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                    <div className="mt-2">
                      {shouldShowReadMore ? (
                        <div>
                          <CardDescription
                            className="text-base"
                            dangerouslySetInnerHTML={{
                              __html:
                                displayDescription ||
                                "No description available",
                            }}
                          />
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-2 p-0 h-auto text-primary"
                            onClick={() =>
                              setExpandedDescriptions((prev) => ({
                                ...prev,
                                [plan.id]: !prev[plan.id],
                              }))
                            }
                          >
                            {isExpanded
                              ? t("dashboard.ads.readLess") || "Read less"
                              : t("dashboard.ads.readMore") || "Read more"}
                          </Button>
                        </div>
                      ) : (
                        <CardDescription
                          className="text-base"
                          dangerouslySetInnerHTML={{
                            __html:
                              plan.description || "No description available",
                          }}
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {formatPrice(plan.price || 0, plan.currency || "EUR")}
                      </span>
                      <span className="text-muted-foreground">
                        /{formatDuration(plan.duration || 0)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    {/* Permissions/Features */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Features & Limits
                      </h4>
                      <ul className="space-y-2">
                        {plan.permissions.map((permission) => (
                          <li
                            key={permission.id}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="flex-1">
                              {permission.type.replace(/_/g, " ").toLowerCase()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {permission.isUnlimited
                                ? "Unlimited"
                                : permission.value || "N/A"}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 mt-auto">
                      {isCurrent ? (
                        <Button className="w-full" disabled>
                          {t("dashboard.subscription.currentPlan")}
                        </Button>
                      ) : isFreePlan(plan.price) ? (
                        <Button className="w-full" disabled>
                          Free Plan - Not Available
                        </Button>
                      ) : isPlanSubscribed(plan.id) ? (
                        isInLastMonth() ? (
                          <Button
                            className="w-full"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => openPaymentMethodDialog(plan.id)}
                            disabled={
                              loadingPlanId != null && loadingPlanId !== plan.id
                            }
                          >
                            {loadingPlanId === plan.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              t("dashboard.subscription.renew")
                            )}
                          </Button>
                        ) : (
                          <Button className="w-full" variant="outline" disabled>
                            {t(
                              "dashboard.subscription.renewalAvailableIn",
                              {
                                days:
                                  Math.ceil(
                                    (new Date(
                                      currentSubscription?.endDate || ""
                                    ).getTime() -
                                      new Date().getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  ) - 30,
                              }
                            )}
                          </Button>
                        )
                      ) : isDowngrade(plan.price || 0) ? (
                        <Button className="w-full" variant="outline" disabled>
                          {t("dashboard.subscription.lowerPlan")}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => openPaymentMethodDialog(plan.id)}
                          disabled={
                            loadingPlanId != null && loadingPlanId !== plan.id
                          }
                        >
                          {loadingPlanId === plan.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isUpgrade(plan.price || 0) ? (
                            t("dashboard.subscription.upgrade")
                          ) : (
                            t("dashboard.subscription.subscribe")
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment method choice dialog (PayPal vs Stripe) */}
      <Dialog open={paymentMethodDialogOpen} onOpenChange={setPaymentMethodDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.subscription.choosePaymentMethod") ||
                "Choose payment method"}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.subscription.choosePaymentMethodDesc") ||
                "Pay with PayPal or use a card (Visa, Mastercard, Klarna, etc.) via our secure payment provider."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => handleSubscribeWithProvider("paypal")}
              disabled={loadingPlanId != null}
            >
              <Wallet className="h-5 w-5" />
              <span>
                {t("dashboard.subscription.payWithPayPal") || "Pay with PayPal"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => handleSubscribeWithProvider("stripe")}
              disabled={loadingPlanId != null}
            >
              <CreditCard className="h-5 w-5" />
              <span>
                {t("dashboard.subscription.payWithCard") ||
                  "Card (Visa, Mastercard, Klarna, etc.)"}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.subscription.billingInformation")}</CardTitle>
          <CardDescription>
            {t("dashboard.subscription.billingInformationDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">{t("dashboard.subscription.billingAddress")}</h4>
                <p className="text-sm text-muted-foreground">
                  {restaurantAccount?.name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {restaurantAccount?.address || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("dashboard.subscription.paymentMethodLabel")}</h4>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentSubscription?.paymentMethod || t("dashboard.subscription.noPaymentMethod")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
