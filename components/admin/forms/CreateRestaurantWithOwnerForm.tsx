"use client";

import { useState } from "react";
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
import { createRestaurantWithOwner } from "@/features/admin/restaurants/adminRestaurantsThunks";
import type { CreateRestaurantWithOwnerRequest } from "@/features/admin/restaurants/adminRestaurantsTypes";
import { Loader2, MapPin } from "lucide-react";
import GoogleMapPicker from "@/components/common/GoogleMapPicker";

interface CreateRestaurantWithOwnerFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateRestaurantWithOwnerForm({
  onClose,
  onSuccess,
}: CreateRestaurantWithOwnerFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.adminPlans.items);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [planId, setPlanId] = useState<string>("none");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const lat = latitude.trim() ? Number(latitude) : NaN;
    const lng = longitude.trim() ? Number(longitude) : NaN;
    if (!email.trim() || !password || !name.trim() || !address.trim()) {
      setFormError(t("createRestaurantError"));
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      setFormError(t("createRestaurantError"));
      return;
    }

    const payload: CreateRestaurantWithOwnerRequest = {
      email: email.trim(),
      password,
      fullName: fullName.trim() || undefined,
      name: name.trim(),
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      planId: planId ? Number(planId) : undefined,
    };

    setSubmitLoading(true);
    const result = await dispatch(createRestaurantWithOwner(payload));
    setSubmitLoading(false);

    if (createRestaurantWithOwner.fulfilled.match(result)) {
      toast({
        title: t("success"),
        description: t("createRestaurantSuccess"),
      });
      onSuccess?.();
      onClose();
    } else {
      const message = result.payload ?? t("createRestaurantError");
      setFormError(message);
      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {formError}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          {t("ownerDetails")}
        </h4>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="create-owner-email">{t("email")}</Label>
            <Input
              id="create-owner-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-owner-password">{t("password")}</Label>
            <Input
              id="create-owner-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-owner-fullName">
              {t("fullNameOptional")}
            </Label>
            <Input
              id="create-owner-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("fullName")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          {t("restaurantDetails")}
        </h4>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="create-restaurant-name">
              {t("restaurantName")}
            </Label>
            <Input
              id="create-restaurant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("restaurantName")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-restaurant-address">{t("address")}</Label>
            <Input
              id="create-restaurant-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("address")}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="create-restaurant-lat">{t("latitude")}</Label>
              <Input
                id="create-restaurant-lat"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-restaurant-lng">{t("longitude")}</Label>
              <Input
                id="create-restaurant-lng"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="0"
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
            {latitude.trim() &&
              longitude.trim() &&
              !Number.isNaN(Number(latitude)) &&
              !Number.isNaN(Number(longitude)) && (
                <span className="text-xs text-muted-foreground">
                  {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
                </span>
              )}
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
          </div>
        </div>
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
            t("create")
          )}
        </Button>
      </div>
    </form>
  );
}
