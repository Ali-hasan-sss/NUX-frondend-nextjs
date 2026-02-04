"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
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
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { updateAdminRestaurant } from "@/features/admin/restaurants/adminRestaurantsThunks";
import type { AdminRestaurant } from "@/features/admin/restaurants/adminRestaurantsTypes";
import { Loader2, MapPin } from "lucide-react";
import GoogleMapPicker from "@/components/common/GoogleMapPicker";

interface EditRestaurantFormProps {
  restaurant: AdminRestaurant | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditRestaurantForm({
  restaurant,
  onClose,
  onSuccess,
}: EditRestaurantFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.adminPlans.items);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [planId, setPlanId] = useState<string>("none");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name ?? "");
      setAddress(restaurant.address ?? "");
      setLatitude(
        restaurant.latitude != null ? String(restaurant.latitude) : ""
      );
      setLongitude(
        restaurant.longitude != null ? String(restaurant.longitude) : ""
      );
      setPlanId("none");
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setFormError(null);

    const lat = latitude.trim() ? Number(latitude) : NaN;
    const lng = longitude.trim() ? Number(longitude) : NaN;
    if (!name.trim() || !address.trim()) {
      setFormError(t("createRestaurantError"));
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      setFormError(t("createRestaurantError"));
      return;
    }

    setSubmitLoading(true);
    const result = await dispatch(
      updateAdminRestaurant({
        id: restaurant.id,
        data: {
          name: name.trim(),
          address: address.trim(),
          latitude: lat,
          longitude: lng,
          planId: planId && planId !== "none" ? Number(planId) : undefined,
        },
      })
    );
    setSubmitLoading(false);

    if (updateAdminRestaurant.fulfilled.match(result)) {
      toast({
        title: t("success"),
        description: t("update") + " " + t("restaurant"),
      });
      onSuccess?.();
      onClose();
    } else {
      const message = (result.payload as string) ?? t("createRestaurantError");
      setFormError(message);
      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    }
  };

  if (!restaurant) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {formError}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="edit-name">{t("restaurantName")}</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-address">{t("address")}</Label>
        <Input
          id="edit-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>{t("latitude")}</Label>
          <Input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("longitude")}</Label>
          <Input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMapPicker(true)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {t("selectOnMap")}
        </Button>
      </div>
      <div className="grid gap-2">
        <Label>{t("selectPlanOptional")}</Label>
        <Select value={planId} onValueChange={setPlanId}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectPlanOptional")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">—</SelectItem>
            {plans.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t("addNewSubscription")} (optional)
        </p>
      </div>

      <GoogleMapPicker
        open={showMapPicker}
        onOpenChange={setShowMapPicker}
        initialLat={latitude ? Number(latitude) : 0}
        initialLng={longitude ? Number(longitude) : 0}
        onSelect={(coords) => {
          setLatitude(String(coords.latitude));
          setLongitude(String(coords.longitude));
          setShowMapPicker(false);
        }}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitLoading}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={submitLoading}>
          {submitLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("save")
          )}
        </Button>
      </div>
    </form>
  );
}
