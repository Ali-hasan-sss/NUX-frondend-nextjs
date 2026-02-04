"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { adminActivateSubscription } from "@/features/admin/subscriptions/adminSubscriptionsThunks";
import type { AdminRestaurant } from "@/features/admin/restaurants/adminRestaurantsTypes";
import type { AdminSubscription } from "@/features/admin/subscriptions/adminSubscriptionsTypes";

interface RestaurantDetailsModalProps {
  open: boolean;
  onClose: () => void;
  restaurant:
    | (AdminRestaurant & { subscriptions?: AdminSubscription[] })
    | null;
  onSubscriptionAdded?: (restaurantId: string) => void | Promise<void>;
}

export function RestaurantDetailsModal({
  open,
  onClose,
  restaurant,
  onSubscriptionAdded,
}: RestaurantDetailsModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.adminPlans.items);

  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [addSubscriptionLoading, setAddSubscriptionLoading] = useState(false);

  if (!restaurant) return null;

  const subscriptions = restaurant.subscriptions ?? [];

  const handleAddSubscription = async () => {
    if (!selectedPlanId || !restaurant.id) return;
    setAddSubscriptionLoading(true);
    const result = await dispatch(
      adminActivateSubscription({
        restaurantId: restaurant.id,
        planId: Number(selectedPlanId),
      })
    );
    setAddSubscriptionLoading(false);
    if (adminActivateSubscription.fulfilled.match(result)) {
      toast({
        title: t("success"),
        description: t("activateSubscription"),
      });
      setAddSubscriptionOpen(false);
      setSelectedPlanId("");
      await onSubscriptionAdded?.(restaurant.id);
    } else {
      toast({
        title: t("error"),
        description: (result.payload as string) ?? t("createRestaurantError"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("restaurantDetails")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Restaurant info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={restaurant.logo || "/placeholder-logo.png"}
                alt={restaurant.name}
              />
              <AvatarFallback>
                {restaurant.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="font-semibold text-lg">{restaurant.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("address")}: {restaurant.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("ownerEmail")}: {restaurant.owner?.email ?? t("na")}
                {restaurant.owner?.fullName && (
                  <span> ({restaurant.owner.fullName})</span>
                )}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                  {restaurant.isActive ? t("active") : t("inactive")}
                </Badge>
                <Badge
                  variant={
                    restaurant.isSubscriptionActive ? "default" : "secondary"
                  }
                >
                  {t("subscribed")}:{" "}
                  {restaurant.isSubscriptionActive ? t("yes") : t("no")}
                </Badge>
              </div>
              {restaurant.createdAt && (
                <p className="text-xs text-muted-foreground">
                  {t("joinDate")}: {formatDate(restaurant.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Subscriptions section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{t("subscriptions")}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddSubscriptionOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("addNewSubscription")}
              </Button>
            </div>
            {subscriptions.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                {t("noSubscriptionsFound")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("plan")}</TableHead>
                    <TableHead>{t("amount")}</TableHead>
                    <TableHead>{t("startDate")}</TableHead>
                    <TableHead>{t("endDate")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={String(sub.id)}>
                      <TableCell>{sub.plan?.title ?? "N/A"}</TableCell>
                      <TableCell>
                        {sub.plan
                          ? `${sub.plan.price} ${sub.plan.currency ?? ""}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {sub.startDate ? formatDate(sub.startDate) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {sub.endDate ? formatDate(sub.endDate) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.status === "ACTIVE"
                              ? "default"
                              : sub.status === "CANCELLED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Add subscription dialog */}
          <Dialog
            open={addSubscriptionOpen}
            onOpenChange={setAddSubscriptionOpen}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addNewSubscription")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label>{t("plan")}</Label>
                  <Select
                    value={selectedPlanId}
                    onValueChange={setSelectedPlanId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectPlanOptional")} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.title}
                          {p.currency && (
                            <span className="text-muted-foreground ml-1">
                              — {p.price} {p.currency}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddSubscriptionOpen(false)}
                    disabled={addSubscriptionLoading}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleAddSubscription}
                    disabled={!selectedPlanId || addSubscriptionLoading}
                  >
                    {addSubscriptionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("activateSubscription")
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
