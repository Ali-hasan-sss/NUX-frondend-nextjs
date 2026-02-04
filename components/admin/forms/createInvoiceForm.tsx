"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppDispatch, RootState } from "@/app/store";
import { createAdminInvoice } from "@/features/admin/invoices/adminInvoicesThunks";
import { fetchAdminRestaurants } from "@/features/admin/restaurants/adminRestaurantsThunks";
import { fetchAdminSubscriptions } from "@/features/admin/subscriptions/adminSubscriptionsThunks";
import { useLanguage } from "@/hooks/use-language";

interface CreateInvoiceFormProps {
  onSubmit: () => void;
  onClose: () => void;
}

export function CreateInvoiceForm({
  onSubmit,
  onClose,
}: CreateInvoiceFormProps) {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const restaurants = useSelector(
    (state: RootState) => state.adminRestaurants.items
  );
  const subscriptions = useSelector(
    (state: RootState) => state.adminSubscriptions.items
  );

  const [formData, setFormData] = useState({
    restaurantId: "",
    subscriptionId: "",
    amountDue: "",
    amountPaid: "",
    currency: "EUR",
    status: "PENDING",
    paymentMethod: "CASH",
    periodStart: "",
    periodEnd: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminRestaurants());
    dispatch(fetchAdminSubscriptions({}));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(
        createAdminInvoice({
          restaurantId: formData.restaurantId,
          subscriptionId:
            formData.subscriptionId && formData.subscriptionId !== "none"
              ? Number(formData.subscriptionId)
              : undefined,
          amountDue: Number(formData.amountDue),
          amountPaid: formData.amountPaid ? Number(formData.amountPaid) : 0,
          currency: formData.currency,
          status: formData.status as any,
          paymentMethod: formData.paymentMethod,
          periodStart: formData.periodStart || undefined,
          periodEnd: formData.periodEnd || undefined,
        })
      );

      onSubmit();
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantId">Restaurant *</Label>
          <Select
            value={formData.restaurantId}
            onValueChange={(value) => handleChange("restaurantId", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} - {restaurant.owner.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscriptionId">{t("subscriptionOptional")}</Label>
          <Select
            value={formData.subscriptionId}
            onValueChange={(value) => handleChange("subscriptionId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectSubscription")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("noSubscription")}</SelectItem>
              {subscriptions.map((subscription) => (
                <SelectItem
                  key={subscription.id}
                  value={String(subscription.id)}
                >
                  {subscription.restaurant.name} - {subscription.plan.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountDue">{t("amountDue")} *</Label>
          <Input
            id="amountDue"
            type="number"
            step="0.01"
            value={formData.amountDue}
            onChange={(e) => handleChange("amountDue", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountPaid">{t("amountPaid")}</Label>
          <Input
            id="amountPaid"
            type="number"
            step="0.01"
            value={formData.amountPaid}
            onChange={(e) => handleChange("amountPaid", e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">{t("currency")}</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t("status")}</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">{t("pending")}</SelectItem>
              <SelectItem value="PAID">{t("paid")}</SelectItem>
              <SelectItem value="UNPAID">{t("unpaid")}</SelectItem>
              <SelectItem value="CANCELLED">{t("cancelled")}</SelectItem>
              <SelectItem value="FAILED">{t("failed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value) => handleChange("paymentMethod", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">{t("paymentCash")}</SelectItem>
              <SelectItem value="CARD (VISA)">
                {t("paymentCardVisa")}
              </SelectItem>
              <SelectItem value="CARD (MASTERCARD)">
                {t("paymentCardMastercard")}
              </SelectItem>
              <SelectItem value="BANK_TRANSFER">
                {t("paymentBankTransfer")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodStart">{t("periodStartDate")}</Label>
          <Input
            id="periodStart"
            type="date"
            value={formData.periodStart}
            onChange={(e) => handleChange("periodStart", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodEnd">{t("periodEndDate")}</Label>
          <Input
            id="periodEnd"
            type="date"
            value={formData.periodEnd}
            onChange={(e) => handleChange("periodEnd", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("creatingInvoice") : t("createInvoice")}
        </Button>
      </div>
    </form>
  );
}
