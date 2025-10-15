"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Shield, Check, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useEffect, useState } from "react";
import {
  createAdminPlan,
  deleteAdminPlan,
  fetchAdminPlans,
  updateAdminPlan,
} from "@/features/admin/plans/adminPlansThunks";
import { PlanFormInput } from "@/components/admin/forms/PlanForm";
import { PlanForm } from "@/components/admin/forms/PlanForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "../confirmMessage";
import { AdminPlan } from "@/features/admin/plans/adminPlansTypes";
import {
  PERMISSION_LABELS,
  PERMISSION_CATEGORIES,
} from "@/features/admin/plans/permissionsConstants";

export function PlanManagement() {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [openDeleteMessage, setOpenDeleteMessage] = useState(false);
  const [deleting, setDeleting] = useState<string | number>("");
  const [editingPlan, setEditingPlan] = useState<PlanFormInput | null>(null);
  const { items, isLoading, error } = useAppSelector(
    (state) => state.adminPlans
  );

  useEffect(() => {
    dispatch(fetchAdminPlans());
  }, [dispatch]);

  const handleSubmit = async (data: PlanFormInput) => {
    if (data.id) {
      await dispatch(updateAdminPlan({ id: data.id, data }));
    } else {
      await dispatch(createAdminPlan(data));
    }
  };
  const handleDelete = async () => {
    if (deleting) await dispatch(deleteAdminPlan(deleting?.toString()));
  };

  const renderPermissions = (permissions: any[]) => {
    if (!permissions || permissions.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          No permissions assigned
        </div>
      );
    }

    const groupedPermissions = permissions.reduce((acc, perm: any) => {
      const category =
        Object.keys(PERMISSION_CATEGORIES).find((cat) =>
          (
            PERMISSION_CATEGORIES[
              cat as keyof typeof PERMISSION_CATEGORIES
            ] as readonly string[]
          ).includes(perm.type)
        ) || "OTHER";

      if (!acc[category]) acc[category] = [];
      acc[category].push(perm);
      return acc;
    }, {} as Record<string, any[]>);

    return (
      <div className="space-y-2">
        {(Object.entries(groupedPermissions) as [string, any[]][]).map(
          ([category, perms]) => (
            <div key={category} className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {category}
              </div>
              <div className="flex flex-wrap gap-1">
                {perms.map((perm: any) => (
                  <Badge
                    key={perm.id}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {PERMISSION_LABELS[
                      perm.type as keyof typeof PERMISSION_LABELS
                    ] || perm.type}
                    {perm.isUnlimited ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : perm.value ? (
                      <span className="text-xs">({perm.value})</span>
                    ) : null}
                  </Badge>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Plan Management
          </h1>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing
          </p>
        </div>
        <Button
          onClick={() => {
            setModalOpen(true);
            setEditingPlan(null);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((plan: AdminPlan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {/* Description as HTML from Quill */}
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: plan.description ?? "",
                      }}
                    />
                  </CardDescription>
                </div>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.currency && (
                  <span className="text-muted-foreground">
                    / {plan.currency}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Duration: {plan.duration} days
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Permissions */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  <span>Permissions</span>
                </div>
                {renderPermissions(plan.permissions)}
              </div>

              {/* Stripe Integration Status */}
              {plan.stripeProductId && plan.stripePriceId && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Stripe Integrated</span>
                </div>
              )}

              {/* Subscribers count */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{plan.subscriberCount} subscribers</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditingPlan(plan as PlanFormInput);
                    setModalOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => {
                    setDeleting(plan.id);
                    setOpenDeleteMessage(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Plan" : "Add New Plan"}
            </DialogTitle>
          </DialogHeader>
          <PlanForm
            initialData={editingPlan || undefined}
            onSubmit={handleSubmit}
            onClose={() => setModalOpen(false)}
            submitLabel={editingPlan ? "Update" : "Create"}
          />
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        onConfirm={handleDelete}
        open={openDeleteMessage}
        setOpen={() => setOpenDeleteMessage(false)}
        message="are you sure for delete this plan"
        confirmText="Delete"
      />
    </div>
  );
}
