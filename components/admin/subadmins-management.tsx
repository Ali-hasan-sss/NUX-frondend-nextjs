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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { subadminService } from "@/features/admin/subadmins/subadminService";
import type {
  SubAdminItem,
  SubAdminPermissionType,
  CreateSubAdminRequest,
} from "@/features/admin/subadmins/subadminTypes";
import ConfirmDialog from "@/components/confirmMessage";
import { useToast } from "@/hooks/use-toast";

function getPermissionOptions(
  t: (key: import("@/lib/translations").TranslationKey) => string
): { value: SubAdminPermissionType; label: string }[] {
  return [
    { value: "MANAGE_USERS", label: t("manageUsersPerm") },
    { value: "MANAGE_PLANS", label: t("managePlansPerm") },
    { value: "MANAGE_RESTAURANTS", label: t("manageRestaurantsPerm") },
    { value: "MANAGE_SUBSCRIPTIONS", label: t("manageSubscriptionsPerm") },
  ];
}

function permissionLabels(
  perms: SubAdminPermissionType[],
  t: (key: import("@/lib/translations").TranslationKey) => string
) {
  return perms
    .map((p) => getPermissionOptions(t).find((o) => o.value === p)?.label ?? p)
    .join(", ");
}

export function SubAdminsManagement() {
  const { t } = useLanguage();
  const [list, setList] = useState<SubAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubAdminItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast } = useToast();
  const PERMISSION_OPTIONS = getPermissionOptions(t);

  // Create form
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createPermissions, setCreatePermissions] = useState<
    SubAdminPermissionType[]
  >([]);

  // Edit form
  const [editPermissions, setEditPermissions] = useState<
    SubAdminPermissionType[]
  >([]);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subadminService.list();
      setList(data);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to load sub-admins";
      setError(msg);
      toast({ title: t("error"), description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const openCreate = () => {
    setCreateEmail("");
    setCreatePassword("");
    setCreateFullName("");
    setCreatePermissions([]);
    setCreateOpen(true);
  };

  const openEdit = (item: SubAdminItem) => {
    setEditingItem(item);
    setEditPermissions(item.permissions);
    setEditOpen(true);
  };

  const toggleCreatePermission = (p: SubAdminPermissionType) => {
    setCreatePermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleEditPermission = (p: SubAdminPermissionType) => {
    setEditPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleCreate = async () => {
    if (!createEmail.trim() || !createPassword) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }
    if (createPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Select at least one permission",
        variant: "destructive",
      });
      return;
    }
    setSubmitLoading(true);
    try {
      const payload: CreateSubAdminRequest = {
        email: createEmail.trim(),
        password: createPassword,
        fullName: createFullName.trim() || undefined,
        permissions: createPermissions,
      };
      await subadminService.create(payload);
      toast({
        title: "Success",
        description: "Sub-admin created successfully",
      });
      setCreateOpen(false);
      loadList();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to create sub-admin";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    if (editPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Select at least one permission",
        variant: "destructive",
      });
      return;
    }
    setSubmitLoading(true);
    try {
      await subadminService.update(editingItem.id, {
        permissions: editPermissions,
      });
      toast({
        title: "Success",
        description: "Sub-admin updated successfully",
      });
      setEditOpen(false);
      setEditingItem(null);
      loadList();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to update sub-admin";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSubmitLoading(true);
    try {
      await subadminService.delete(deletingId);
      toast({
        title: "Success",
        description: "Sub-admin removed successfully",
      });
      setDeleteOpen(false);
      setDeletingId(null);
      loadList();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to remove sub-admin";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t("subadminsTitle")}</CardTitle>
            <CardDescription>{t("subadminsDescription")}</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addSubAdmin")}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              {t("noSubAdminsYet")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("permissionsLabel")}</TableHead>
                  <TableHead className="w-[100px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.user.email}</TableCell>
                    <TableCell>{item.user.fullName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {permissionLabels(item.permissions, t)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(item)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeleteOpen(true);
                          }}
                          aria-label="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add sub-admin</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-password">{t("password")}</Label>
              <Input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-fullName">{t("fullNameOptional")}</Label>
              <Input
                id="create-fullName"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("permissionsLabel")}</Label>
              <div className="flex flex-col gap-2">
                {PERMISSION_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`create-${opt.value}`}
                      checked={createPermissions.includes(opt.value)}
                      onCheckedChange={() => toggleCreatePermission(opt.value)}
                    />
                    <label
                      htmlFor={`create-${opt.value}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={submitLoading}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={submitLoading}>
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("create")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editPermissionsTitle")}</DialogTitle>
            {editingItem && (
              <CardDescription>
                {editingItem.user.email} —{" "}
                {editingItem.user.fullName ?? "No name"}
              </CardDescription>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("permissionsLabel")}</Label>
              <div className="flex flex-col gap-2">
                {PERMISSION_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${opt.value}`}
                      checked={editPermissions.includes(opt.value)}
                      onCheckedChange={() => toggleEditPermission(opt.value)}
                    />
                    <label
                      htmlFor={`edit-${opt.value}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={submitLoading}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleUpdate} disabled={submitLoading}>
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title={t("removeSubAdmin")}
        message={t("removeSubAdminConfirm")}
        confirmText={t("removeSubAdmin")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
