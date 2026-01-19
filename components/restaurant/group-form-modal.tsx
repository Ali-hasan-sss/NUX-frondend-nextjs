"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  initialData?: {
    name: string;
    description: string;
  };
  isEdit?: boolean;
  isLoading?: boolean;
}

export function GroupFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  isLoading = false,
}: GroupFormModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Set initial data when editing
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
      });
    } else if (!isEdit) {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [isEdit, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || "",
    });
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("dashboard.groups.editGroup") : t("dashboard.groups.createNewGroup")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("dashboard.groups.updateGroupInfo")
              : t("dashboard.groups.createGroupAndInvite")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("dashboard.groups.groupNameRequired")}</Label>
            <Input
              id="name"
              placeholder={t("dashboard.groups.groupNamePlaceholder")}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("dashboard.groups.description")}</Label>
            <Input
              id="description"
              placeholder={t("dashboard.groups.optionalDescription")}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Actions */}
          <div className={cn("flex justify-end gap-2 pt-4", isRTL ? "flex-row-reverse" : "")}>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("dashboard.settings.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                  {isEdit ? t("dashboard.groups.updating") : t("dashboard.groups.creating")}
                </>
              ) : isEdit ? (
                t("dashboard.groups.updateGroup")
              ) : (
                t("dashboard.groups.createGroup")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
