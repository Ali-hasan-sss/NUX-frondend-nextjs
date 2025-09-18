"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchPackages,
  createPackageThunk,
  updatePackageThunk,
  deletePackageThunk,
} from "@/features/restaurant/packages/packagesThunks";
import type { RestaurantPackage } from "@/features/restaurant/packages/packagesTypes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Euro } from "lucide-react";
import ConfirmDialog from "@/components/confirmMessage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Supported European currencies by Stripe
const SUPPORTED_CURRENCIES = [
  { code: "EUR", name: "Euro (€)", symbol: "€" },
  { code: "USD", name: "US Dollar ($)", symbol: "$" },
  { code: "GBP", name: "British Pound (£)", symbol: "£" },
  { code: "CHF", name: "Swiss Franc (CHF)", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona (SEK)", symbol: "kr" },
];

type FormState = {
  name: string;
  amount: number | string;
  bonus: number | string;
  currency: string;
  description: string;
  isActive: boolean;
  isPublic: boolean;
};

const emptyForm: FormState = {
  name: "",
  amount: "",
  bonus: 0,
  currency: "EUR",
  description: "",
  isActive: true,
  isPublic: true,
};

// Helper function to get currency symbol
const getCurrencySymbol = (currencyCode: string) => {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || currencyCode;
};

export default function PackagesManagement() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.restaurantPackages);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<RestaurantPackage | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const canAddMore = useMemo(() => (items?.length ?? 0) < 10, [items]);

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  useEffect(() => {
    if (openEdit) {
      setForm({
        name: openEdit.name,
        amount: openEdit.amount,
        bonus: openEdit.bonus,
        currency: openEdit.currency,
        description: openEdit.description ?? "",
        isActive: openEdit.isActive,
        isPublic: openEdit.isPublic,
      });
    } else if (!openCreate) {
      setForm(emptyForm);
    }
  }, [openEdit, openCreate]);

  const handleCreate = async () => {
    if (!form.name.trim() || Number(form.amount) <= 0) return;
    await dispatch(
      createPackageThunk({
        name: form.name.trim(),
        amount: Number(form.amount),
        bonus: Number(form.bonus) || 0,
        currency: form.currency || "EUR",
        description: form.description?.trim() || undefined,
        isActive: form.isActive,
        isPublic: form.isPublic,
      })
    )
      .unwrap()
      .then(() => setOpenCreate(false));
  };

  const handleUpdate = async () => {
    if (!openEdit) return;
    if (!form.name.trim() || Number(form.amount) <= 0) return;
    await dispatch(
      updatePackageThunk({
        id: openEdit.id,
        name: form.name.trim(),
        amount: Number(form.amount),
        bonus: Number(form.bonus) || 0,
        currency: form.currency || "EUR",
        description: form.description?.trim() || undefined,
        isActive: form.isActive,
        isPublic: form.isPublic,
      })
    )
      .unwrap()
      .then(() => setOpenEdit(null));
  };

  const handleDelete = async (id: number) => {
    await dispatch(deletePackageThunk(id)).unwrap();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <h2 className="text-2xl font-semibold">Top-up Packages</h2>
          <p className="text-sm text-muted-foreground">
            You can create up to 10 packages. Delete an old one to add more.
          </p>
        </div>
        <Button
          onClick={() => setOpenCreate(true)}
          disabled={!canAddMore}
          className="px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" /> New Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-3">
        {items.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{pkg.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={pkg.isActive ? "default" : "secondary"}>
                    {pkg.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={pkg.isPublic ? "outline" : "secondary"}>
                    {pkg.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-primary">
                  {getCurrencySymbol(pkg.currency)}
                </span>
                <span className="font-medium">{pkg.amount}</span>
                <span className="text-xs text-muted-foreground">
                  {pkg.currency}
                </span>
                {pkg.bonus > 0 && (
                  <span className="text-sm text-muted-foreground">
                    + {pkg.bonus} bonus
                  </span>
                )}
              </div>
              {pkg.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {pkg.description}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenEdit(pkg)}
              >
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <ConfirmDialog
                open={confirmDeleteId === pkg.id}
                setOpen={(v) => setConfirmDeleteId(v ? pkg.id : null)}
                title="Delete package"
                message="Are you sure you want to delete this package?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => handleDelete(pkg.id)}
                trigger={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                }
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Package</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="€50 + €5 bonus"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Bonus</Label>
                <Input
                  type="number"
                  value={form.bonus}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bonus: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPublic}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isPublic: v }))
                  }
                />
                <Label>Public</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isLoading ||
                !canAddMore ||
                !form.name.trim() ||
                Number(form.amount) <= 0
              }
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!openEdit}
        onOpenChange={(v) => setOpenEdit(v ? openEdit : null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Bonus</Label>
                <Input
                  type="number"
                  value={form.bonus}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bonus: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPublic}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isPublic: v }))
                  }
                />
                <Label>Public</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEdit(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                isLoading || !form.name.trim() || Number(form.amount) <= 0
              }
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
