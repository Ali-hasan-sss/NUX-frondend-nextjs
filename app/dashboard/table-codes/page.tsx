"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchRestaurantAccount } from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
import { TablesManagement } from "@/components/restaurant/qr-code-management";

export default function TableCodesPage() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAppSelector((s) => s.restaurantAccount);

  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  if (isLoading || !data?.id) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <TablesManagement restaurantId={data.id} />;
}
