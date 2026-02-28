"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchRestaurantAccount } from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
import { FloorPlanEditor } from "@/components/restaurant/floor-plan-editor";
import { useTranslation } from "react-i18next";

export default function FloorPlanPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAppSelector((s) => s.restaurantAccount);

  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  if (isLoading || !data?.id) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">{t("dashboard.floorPlan.loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("dashboard.sidebar.floorPlan") || "Floor Plan"}</h1>
      <FloorPlanEditor />
    </div>
  );
}
