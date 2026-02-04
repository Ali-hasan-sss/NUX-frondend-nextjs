"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { fetchAdminPlans } from "@/features/admin/plans/adminPlansThunks";
import { useAppDispatch } from "@/app/hooks";
import { fetchAdminRestaurants } from "@/features/admin/restaurants/adminRestaurantsThunks";
import { useLanguage } from "@/hooks/use-language";

export interface SubscriptionFormInput {
  restaurantId?: string;
  planId: number | null;
}

interface SubscriptionFormProps {
  initialData?: SubscriptionFormInput;
  onSubmit: (data: SubscriptionFormInput) => Promise<void>;
  onClose: () => void;
  submitLabel?: string;
}

export function SubscriptionForm({
  initialData,
  onSubmit,
  onClose,
  submitLabel,
}: SubscriptionFormProps) {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<SubscriptionFormInput>(
    initialData || {
      restaurantId: "",
      planId: null,
    }
  );
  const [loading, setLoading] = useState(false);
  const plans = useSelector((state: RootState) => state.adminPlans.items);
  const restaurant = useSelector(
    (state: RootState) => state.adminRestaurants.items
  );

  useEffect(() => {
    dispatch(fetchAdminPlans());
    if (!initialData?.restaurantId) dispatch(fetchAdminRestaurants());
  }, [dispatch]);

  const handleChange = (key: keyof SubscriptionFormInput, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-5 items-center">
        <div className="w-full md:w-1/2">
          <Label htmlFor="planId">{t("plan")}</Label>
          <Select
            value={formData?.planId !== null ? String(formData.planId) : ""}
            onValueChange={(val: string) => handleChange("planId", Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("choosePlan")} />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem value={p.id.toString()}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!initialData?.restaurantId && (
          <div className="w-full md:w-1/2">
            <Label htmlFor="restaurantId">{t("restaurant")}</Label>
            <Select
              value={
                formData?.restaurantId ? String(formData.restaurantId) : ""
              }
              onValueChange={(val: string) => handleChange("restaurantId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("chooseRestaurant")} />
              </SelectTrigger>
              <SelectContent>
                {restaurant.map((R) => (
                  <SelectItem value={R.id.toString()}>{R.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("saving") : submitLabel ?? t("save")}
        </Button>
      </div>
    </form>
  );
}
