"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FilterBar } from "@/components/filters/FilterBar";
import { LabeledInput } from "@/components/filters/LabeledInput";
import { LabeledSelect } from "@/components/filters/LabeledSelect";
import { PageSizeSelect } from "@/components/filters/PageSizeSelect";
import { formatDate } from "@/lib/utils";
import { Search, MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { store } from "@/app/store";
import {
  fetchAdminRestaurants,
  updateAdminRestaurant,
  deleteAdminRestaurant,
} from "@/features/admin/restaurants/adminRestaurantsThunks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { fetchAdminPlans } from "@/features/admin/plans/adminPlansThunks";
import { CreateRestaurantWithOwnerForm } from "./forms/CreateRestaurantWithOwnerForm";
import { EditRestaurantForm } from "./forms/EditRestaurantForm";
import { RestaurantDetailsModal } from "./RestaurantDetailsModal";
import ConfirmDialog from "@/components/confirmMessage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminRestaurant } from "@/features/admin/restaurants/adminRestaurantsTypes";
import type { AdminSubscription } from "@/features/admin/subscriptions/adminSubscriptionsTypes";

export function RestaurantsManagement() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [planFilter, setPlanFilter] = useState(""); // planId
  const [subscriptionFilter, setSubscriptionFilter] = useState("all"); // true = active, false = expired, all
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  const [detailsRestaurant, setDetailsRestaurant] = useState<
    (AdminRestaurant & { subscriptions?: AdminSubscription[] }) | null
  >(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState<
    (AdminRestaurant & { subscriptions?: AdminSubscription[] }) | null
  >(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteRestaurantId, setDeleteRestaurantId] = useState<string | null>(
    null
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { items, pagination, isLoading, error } = useAppSelector(
    (state) => state.adminRestaurants
  );

  const plans = useAppSelector((state) => state.adminPlans.items);

  useEffect(() => {
    dispatch(fetchAdminPlans());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      fetchAdminRestaurants({
        search: searchTerm || undefined,
        planId: planFilter || undefined,
        subscriptionActive:
          subscriptionFilter === "all"
            ? undefined
            : subscriptionFilter === "subscribed"
            ? true
            : false,
        page: currentPage,
        pageSize,
      })
    );
  }, [
    dispatch,
    debouncedSearchTerm,
    planFilter,
    subscriptionFilter,
    pageSize,
    currentPage,
  ]);

  const refetchList = () => {
    dispatch(
      fetchAdminRestaurants({
        search: searchTerm || undefined,
        planId: planFilter || undefined,
        subscriptionActive:
          subscriptionFilter === "all"
            ? undefined
            : subscriptionFilter === "subscribed"
            ? true
            : false,
        page: currentPage,
        pageSize,
      })
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteRestaurantId) return;
    dispatch(deleteAdminRestaurant(deleteRestaurantId)).then(() => {
      setDeleteRestaurantId(null);
      refetchList();
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("restaurantManagement")}
        </h1>
        <p className="text-muted-foreground">
          {t("manageRestaurantsDescription")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("filters")}</CardTitle>
          <CardDescription>{t("searchAndFilterRestaurants")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <LabeledInput
              label={t("searchByRestaurantNameOrEmail")}
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("searchByRestaurantNameOrEmail")}
            />
            <div className="flex  items-center gap-2">
              <LabeledSelect
                label={t("subscription")}
                value={subscriptionFilter}
                onChange={setSubscriptionFilter}
                options={[
                  { label: t("all"), value: "all" },
                  { label: t("activeSubscription"), value: "subscribed" },
                  { label: t("expiredSubscription"), value: "expired" },
                ]}
              />
              <LabeledSelect
                label={t("plan")}
                value={planFilter}
                onChange={setPlanFilter}
                options={[
                  { label: t("all"), value: "all" },
                  ...plans.map((p) => ({
                    label: p.title,
                    value: p.id.toString(),
                  })),
                ]}
              />
              <PageSizeSelect value={pageSize} onChange={setPageSize} />
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>
                {t("restaurantsCount")} ({pagination.totalItems})
              </CardTitle>
              <CardDescription>{t("allRegisteredUsers")}</CardDescription>
            </div>
            <Button
              onClick={() => setAddRestaurantOpen(true)}
              className="shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("addRestaurant")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-destructive mb-3">{error}</div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("restaurant")}</TableHead>
                  <TableHead>{t("ownerEmail")}</TableHead>
                  <TableHead>{t("subscribed")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("joinDate")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6 text-center text-muted-foreground">
                        {t("loadingRestaurants")}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6 text-center text-muted-foreground">
                        {t("noRestaurantsFound")}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map(
                    (
                      restaurant: AdminRestaurant & {
                        subscriptions?: AdminSubscription[];
                      }
                    ) => {
                      return (
                        <TableRow key={restaurant.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    restaurant.logo || "/placeholder-logo.png"
                                  }
                                  alt={restaurant.name}
                                />
                                <AvatarFallback>
                                  {restaurant.name?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {restaurant.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {restaurant.owner?.email || (
                              <span className="text-muted-foreground">
                                {t("na")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                restaurant.isSubscriptionActive
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {restaurant.isSubscriptionActive
                                ? t("yes")
                                : t("no")}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                restaurant.isActive ? "default" : "secondary"
                              }
                            >
                              {restaurant.isActive
                                ? t("active")
                                : t("inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {restaurant.createdAt ? (
                              formatDate(restaurant.createdAt)
                            ) : (
                              <span className="text-muted-foreground">
                                {t("na")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDetailsRestaurant(restaurant);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditRestaurant(restaurant);
                                    setEditOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t("editRestaurant")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setDeleteRestaurantId(restaurant.id);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("deleteRestaurant")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                )}
              </TableBody>
            </Table>

            {/* Restaurant details modal (includes subscriptions) */}
            <RestaurantDetailsModal
              open={detailsOpen}
              onClose={() => {
                setDetailsOpen(false);
                setDetailsRestaurant(null);
              }}
              restaurant={detailsRestaurant}
              onSubscriptionAdded={async (restaurantId) => {
                await dispatch(
                  fetchAdminRestaurants({
                    search: searchTerm || undefined,
                    planId: planFilter || undefined,
                    subscriptionActive:
                      subscriptionFilter === "all"
                        ? undefined
                        : subscriptionFilter === "subscribed"
                        ? true
                        : false,
                    page: currentPage,
                    pageSize,
                  })
                );
                const updated = store
                  .getState()
                  .adminRestaurants.items.find((r) => r.id === restaurantId);
                if (updated) setDetailsRestaurant(updated);
              }}
            />

            {/* Edit Restaurant modal */}
            <Dialog
              open={editOpen}
              onOpenChange={(open) => {
                if (!open) setEditRestaurant(null);
                setEditOpen(open);
              }}
            >
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("editRestaurant")}</DialogTitle>
                </DialogHeader>
                <EditRestaurantForm
                  restaurant={editRestaurant}
                  onClose={() => {
                    setEditOpen(false);
                    setEditRestaurant(null);
                  }}
                  onSuccess={refetchList}
                />
              </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <ConfirmDialog
              open={deleteOpen}
              setOpen={(open) => {
                setDeleteOpen(open);
                if (!open) setDeleteRestaurantId(null);
              }}
              title={t("deleteRestaurant")}
              message={t("areYouSureDeleteRestaurant")}
              confirmText={t("delete")}
              cancelText={t("cancel")}
              onConfirm={handleDeleteConfirm}
            />

            {/* Add Restaurant with Owner modal */}
            <Dialog
              open={addRestaurantOpen}
              onOpenChange={setAddRestaurantOpen}
            >
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("addRestaurantTitle")}</DialogTitle>
                </DialogHeader>
                <CreateRestaurantWithOwnerForm
                  onClose={() => setAddRestaurantOpen(false)}
                  onSuccess={refetchList}
                />
              </DialogContent>
            </Dialog>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    {/* Previous */}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 && setCurrentPage(currentPage - 1)
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {/* Pages */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {/* Next */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < pagination.totalPages &&
                          setCurrentPage(currentPage + 1)
                        }
                        className={
                          currentPage === pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
