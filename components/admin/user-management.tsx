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
import { Search, MoreHorizontal, Edit, Trash2, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from "@/features/admin/users/adminUsersThunks";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { UserForm, UserFormInput } from "./forms/userForm";
import ConfirmDialog from "../confirmMessage";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { formatDate } from "@/lib/utils";
import { FilterBar } from "@/components/filters/FilterBar";
import { LabeledInput } from "@/components/filters/LabeledInput";
import { LabeledSelect } from "@/components/filters/LabeledSelect";
import { PageSizeSelect } from "@/components/filters/PageSizeSelect";

interface inetialData {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "RESTAURANT_OWNER" | "ADMIN";
  isActive: boolean;
  password?: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [roleFilter, setRoleFilter] = useState<
    "ADMIN" | "RESTAURANT_OWNER" | "USER" | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<inetialData | null>(null);
  const [openDeleteMessage, setOpenDeleteMessage] = useState(false);
  const [deleting, setDeleting] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const dispatch = useAppDispatch();
  const { items, pagination, isLoading, error } = useAppSelector(
    (state) => state.adminUsers
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const role =
      roleFilter === "all"
        ? undefined
        : roleFilter === "RESTAURANT_OWNER"
        ? "RESTAURANT_OWNER"
        : roleFilter === "ADMIN"
        ? "ADMIN"
        : "USER";
    const isActive =
      statusFilter === "all" ? undefined : statusFilter === "active";

    const email = debouncedSearchTerm.trim() || undefined;

    dispatch(
      fetchAdminUsers({
        role,
        isActive,
        email,
        pageNumber: currentPage,
        pageSize,
      })
    );
  }, [
    dispatch,
    currentPage,
    pageSize,
    debouncedSearchTerm,
    roleFilter,
    statusFilter,
  ]);

  type UIAdminUser = (typeof items)[number] & {
    restaurantName?: string | null;
    subscriptionPlan?: string | null;
    joinDate?: string | null;
    status: "active" | "inactive";
  };

  const uiUsers: UIAdminUser[] = items.map((u) => ({
    ...u,
    status: u.isActive ? "active" : "inactive",
  }));

  const handleSubmit = async (data: UserFormInput) => {
    if (editingUser) {
      await dispatch(updateAdminUser({ id: editingUser.id, data: data }));
      setEditingUser(null);
      setModalOpen(false);
    } else {
      await dispatch(createAdminUser(data));
      setModalOpen(false);
    }
    console.log(data);
  };
  const handleDelete = async () => {
    if (deleting) await dispatch(deleteAdminUser(deleting?.toString()));
  };
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">
          Manage restaurant owners, admins, and system users
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <LabeledInput
              label="search by email"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email, or restaurant..."
            />
            <div className="flex  items-center gap-2">
              <LabeledSelect
                label="Role"
                value={roleFilter}
                onChange={(v) =>
                  setRoleFilter(
                    v as "ADMIN" | "RESTAURANT_OWNER" | "USER" | "all"
                  )
                }
                options={[
                  { label: "All Roles", value: "all" },
                  { label: "Restaurant Owner", value: "RESTAURANT_OWNER" },
                  { label: "Admins", value: "ADMIN" },
                  { label: "Users", value: "USER" },
                ]}
              />
              <LabeledSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
              <PageSizeSelect value={pageSize} onChange={setPageSize} />
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between ">
            <div className="flex flex-col gap-1">
              <CardTitle>Users ({pagination.totalItems})</CardTitle>
              <CardDescription>
                All registered users in the system
              </CardDescription>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setEditingUser(null);
                setModalOpen(true);
              }}
            >
              <PlusCircle />
              <span>add new user</span>
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6 text-center text-muted-foreground">
                        Loading users…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6 text-center text-muted-foreground">
                        No users found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN"
                              ? "destructive"
                              : user.role === "USER"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.role === "RESTAURANT_OWNER"
                            ? "Restaurant Owner"
                            : user.role === "USER"
                            ? "user"
                            : "Admin"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? (
                          formatDate(user.createdAt)
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
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user as inetialData);
                                setModalOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setDeleting(user.id);
                                setOpenDeleteMessage(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            initialData={editingUser || undefined}
            onSubmit={handleSubmit}
            onClose={() => setModalOpen(false)}
            submitLabel={editingUser ? "Save" : "Create"}
          />
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        onConfirm={handleDelete}
        open={openDeleteMessage}
        setOpen={() => setOpenDeleteMessage(false)}
        message="are you sure for delete this user"
        confirmText="Delete"
      />
    </div>
  );
}
