"use client";

import { useEffect, useState } from "react";
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
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAdminRestaurants } from "@/features/admin/restaurants/adminRestaurantsThunks";
import { AdminUser } from "@/features/admin/users/adminUsersTypes";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { AdminPlan } from "@/features/admin/plans/adminPlansTypes";
import { fetchAdminPlans } from "@/features/admin/plans/adminPlansThunks";
import SubscriptionsModal from "./forms/SubscriptionsViewModal";
import type { AdminRestaurant } from "@/features/admin/restaurants/adminRestaurantsTypes";
import type { AdminSubscription } from "@/features/admin/subscriptions/adminSubscriptionsTypes";

export function RestaurantsManagement() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [planFilter, setPlanFilter] = useState(""); // planId
  const [subscriptionFilter, setSubscriptionFilter] = useState("all"); // true = active, false = expired, all
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubscriptions, setModalSubscriptions] = useState<
    AdminSubscription[]
  >([]);

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

  const openSubscriptionsModal = (subs: AdminSubscription[]) => {
    setModalSubscriptions(subs);
    setModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Restaurant Management
        </h1>
        <p className="text-muted-foreground">
          Manage restaurants and subscriptions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter restaurants</CardDescription>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <LabeledInput
              label="search by Restaurant name or Email"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by restaurant name or owner email..."
            />
            <div className="flex  items-center gap-2">
              <LabeledSelect
                label="Subscription"
                value={subscriptionFilter}
                onChange={setSubscriptionFilter}
                options={[
                  { label: "All", value: "all" },
                  { label: "Active Subscription", value: "subscribed" },
                  { label: "Expired Subscription", value: "expired" },
                ]}
              />
              <LabeledSelect
                label="Plan"
                value={planFilter}
                onChange={setPlanFilter}
                options={[
                  { label: "All", value: "all" },
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
          <CardTitle>Restaurants ({pagination.totalItems})</CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-destructive mb-3">{error}</div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Owner Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6 text-center text-muted-foreground">
                        Loading restaurants…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6 text-center text-muted-foreground">
                        No restaurants found
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
                              <span className="text-muted-foreground">N/A</span>
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
                              {restaurant.isSubscriptionActive ? "Yes" : "No"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                restaurant.isActive ? "default" : "secondary"
                              }
                            >
                              {restaurant.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {restaurant.createdAt ? (
                              formatDate(restaurant.createdAt)
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
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
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setModalSubscriptions(
                                      restaurant?.subscriptions ?? []
                                    );
                                    setModalOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Subscriptions
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Restaurant
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Restaurant
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

            {/* Modal for active subscriptions */}
            <SubscriptionsModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              subscriptions={modalSubscriptions}
            />

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
